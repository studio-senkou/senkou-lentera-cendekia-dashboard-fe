import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClassValue } from 'clsx'
import { env } from '@/app/env'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export function getFileUrl(path?: string | null): string | undefined {
  if (!path) return undefined
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  try {
    const baseUrl = env.VITE_API_BASE_URL || ''
    const host = new URL(baseUrl).origin
    return `${host}/api/v1/files/${path}`
  } catch (e) {
    return `/files/${path}`
  }
}
