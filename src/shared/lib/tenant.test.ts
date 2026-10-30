// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getTenantSlug } from './tenant'

vi.mock('@/app/env', () => ({
  env: {
    VITE_ROOT_DOMAIN: undefined,
    VITE_DEFAULT_TENANT_SLUG: 'default',
  },
}))

describe('getTenantSlug', () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.replaceState({}, '', '/')
  })

  it('falls back to the configured default tenant', () => {
    expect(getTenantSlug()).toBe('default')
  })

  it('reads and persists a valid tenant query param', () => {
    window.history.replaceState({}, '', '/?tenant=acme')

    expect(getTenantSlug()).toBe('acme')
    expect(localStorage.getItem('lc_tenant_slug')).toBe('acme')
  })

  it('uses the persisted tenant when no param or subdomain exists', () => {
    localStorage.setItem('lc_tenant_slug', 'beta')

    expect(getTenantSlug()).toBe('beta')
  })

  it('ignores invalid stored slugs', () => {
    localStorage.setItem('lc_tenant_slug', 'Not A Slug')

    expect(getTenantSlug()).toBe('default')
  })
})
