// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'

import { http } from './axios'
import { useSessionStore } from '@/shared/hooks/use-session'

const originalAdapter = http.defaults.adapter

function unauthorized(config: InternalAxiosRequestConfig): AxiosError {
  return new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined, {
    data: {},
    status: 401,
    statusText: 'Unauthorized',
    headers: {},
    config,
  })
}

function refreshed(config: InternalAxiosRequestConfig) {
  return {
    data: {
      data: {
        access_token: 'new-access',
        refresh_token: 'new-refresh',
        access_token_expiry: new Date(Date.now() + 60_000).toISOString(),
        refresh_token_expiry: new Date(Date.now() + 60_000).toISOString(),
      },
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  }
}

function isRetry(config: InternalAxiosRequestConfig): boolean {
  return (
    (config as InternalAxiosRequestConfig & { _retry?: boolean })._retry ===
    true
  )
}

describe('http session refresh', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/')
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
    useSessionStore.setState({
      accessToken: 'old-access',
      refreshToken: 'old-refresh',
    })
  })

  afterEach(() => {
    http.defaults.adapter = originalAdapter
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
    useSessionStore.setState({ accessToken: null, refreshToken: null })
  })

  it('refreshes an expired access token and retries the original request', async () => {
    let refreshCalls = 0
    let protectedCalls = 0
    let retriedAuthorization = ''

    http.defaults.adapter = async (config) => {
      if (config.url === '/auth/refresh') {
        refreshCalls += 1
        return refreshed(config)
      }
      if (config.url === '/protected') {
        protectedCalls += 1
        if (!isRetry(config)) throw unauthorized(config)
        retriedAuthorization = String(config.headers.Authorization)
        return {
          data: { ok: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        }
      }
      throw new Error(`Unexpected request: ${config.url}`)
    }

    const response = await http.get('/protected')

    expect(response.data).toEqual({ ok: true })
    expect(refreshCalls).toBe(1)
    expect(protectedCalls).toBe(2)
    expect(retriedAuthorization).toBe('Bearer new-access')
    expect(useSessionStore.getState().accessToken).toBe('new-access')
    expect(useSessionStore.getState().refreshToken).toBe('new-refresh')
    expect(Cookies.get('access_token')).toBe('new-access')
    expect(Cookies.get('refresh_token')).toBe('new-refresh')
  })

  it('shares one refresh across concurrent 401 responses', async () => {
    let refreshCalls = 0
    let protectedCalls = 0

    http.defaults.adapter = async (config) => {
      if (config.url === '/auth/refresh') {
        refreshCalls += 1
        await new Promise((resolve) => setTimeout(resolve, 10))
        return refreshed(config)
      }
      if (config.url === '/protected') {
        protectedCalls += 1
        if (!isRetry(config)) throw unauthorized(config)
        return {
          data: { ok: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        }
      }
      throw new Error(`Unexpected request: ${config.url}`)
    }

    const responses = await Promise.all([
      http.get('/protected'),
      http.get('/protected'),
    ])

    expect(responses.map((response) => response.data)).toEqual([
      { ok: true },
      { ok: true },
    ])
    expect(refreshCalls).toBe(1)
    expect(protectedCalls).toBe(4)
  })
})
