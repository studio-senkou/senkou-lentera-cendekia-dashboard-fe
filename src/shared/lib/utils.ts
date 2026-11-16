import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClassValue } from 'clsx'
import { env } from '@/app/env'
import { getTenantSlug } from '@/shared/lib/tenant'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export function getFileUrl(path?: string | null): string | undefined {
  if (!path) return undefined
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  const normalized = path.replace(/^\/+/, '')
  const tenant = `?tenant=${encodeURIComponent(getTenantSlug())}`

  return `${env.VITE_API_BASE_URL}/files/${normalized}${tenant}`
}
