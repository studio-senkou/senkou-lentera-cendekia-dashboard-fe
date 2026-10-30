import axios, { type InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'
import { useSessionStore } from '@/shared/hooks/use-session'
import { env } from '@/app/env'
import { getTenantSlug } from '@/shared/lib/tenant'

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

const AUTH_RETRY_EXEMPT = ['/auth/refresh', '/auth/logout', '/auth/login']

function isAuthRetryExempt(url: string | undefined): boolean {
  return AUTH_RETRY_EXEMPT.some((path) => url?.includes(path))
}

let redirectingToLogin = false

function redirectToLogin(): void {
  if (redirectingToLogin) return
  redirectingToLogin = true
  toast.error('Session expired. Please log in again.')
  window.location.href = '/login'
}

export const http = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

http.interceptors.request.use(
  (config) => {
    const { accessToken } = useSessionStore.getState()

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    config.headers['X-Tenant-Slug'] = getTenantSlug()

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

http.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined
    if (!originalRequest) {
      return Promise.reject(error)
    }

    if (isAuthRetryExempt(originalRequest.url)) {
      return Promise.reject(error)
    }

    const { clearLocalSession, renewSession } = useSessionStore.getState()
    const isGoogleCallbackPopup =
      window.location.pathname === '/auth/callback' && !!window.opener

    if (
      error.response?.status === 404 &&
      error.response?.data?.message === 'Tenant not found'
    ) {
      clearLocalSession()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (error.response?.status === 401) {
      if (originalRequest._retry) {
        if (window.location.pathname !== '/login' && !isGoogleCallbackPopup) {
          clearLocalSession()
          redirectToLogin()
        }
        return Promise.reject(error)
      }

      originalRequest._retry = true

      try {
        await renewSession()
        return http(originalRequest)
      } catch (refreshError) {
        // Popup OAuth flow: let the callback page report the failure to its
        // opener instead of navigating the popup to /login.
        if (window.location.pathname !== '/login' && !isGoogleCallbackPopup) {
          redirectToLogin()
        }
        return Promise.reject(refreshError)
      }
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.')
      return Promise.reject(error)
    }

    return Promise.reject(error)
  },
)
