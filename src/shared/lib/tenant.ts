import { env } from '@/app/env'

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/
const EXCLUDED_SUBDOMAINS = new Set([
  'www',
  'staging',
  'dashboard',
  'localhost',
])
const LOCAL_STORAGE_KEY = 'lc_tenant_slug'

function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug)
}

function extractSubdomain(): string | null {
  const hostname = window.location.hostname

  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    return null
  }

  const rootDomain = env.VITE_ROOT_DOMAIN

  if (rootDomain) {
    const suffix = `.${rootDomain}`
    if (hostname.endsWith(suffix)) {
      const sub = hostname.slice(0, hostname.length - suffix.length)
      if (sub && isValidSlug(sub) && !EXCLUDED_SUBDOMAINS.has(sub)) {
        return sub
      }
    }
  }

  const localSuffix = '.localhost'
  if (hostname.endsWith(localSuffix)) {
    const sub = hostname.slice(0, -localSuffix.length)
    if (sub && isValidSlug(sub) && !EXCLUDED_SUBDOMAINS.has(sub)) {
      return sub
    }
  }

  return null
}

export function getTenantSlug(): string {
  const param = new URLSearchParams(window.location.search).get('tenant')
  if (param && isValidSlug(param)) {
    setTenantSlug(param)
    return param
  }

  const sub = extractSubdomain()
  if (sub) {
    return sub
  }

  const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (stored && isValidSlug(stored)) {
    return stored
  }

  return env.VITE_DEFAULT_TENANT_SLUG ?? 'default'
}

export function setTenantSlug(slug: string): void {
  if (isValidSlug(slug)) {
    localStorage.setItem(LOCAL_STORAGE_KEY, slug)
  }
}
