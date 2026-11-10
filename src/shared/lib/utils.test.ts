import { describe, expect, it, vi } from 'vitest'

import { cn, getFileUrl } from './utils'

vi.mock('@/app/env', () => ({
  env: {
    VITE_API_BASE_URL: 'https://api.example.com/api/v1',
  },
}))

vi.mock('@/shared/lib/tenant', () => ({
  getTenantSlug: () => 'demo',
}))

describe('utils', () => {
  describe('cn', () => {
    it('should merge tailwind classes correctly', () => {
      expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white')
      expect(cn('p-4 p-8')).toBe('p-8')
      expect(cn('bg-red-500', false)).toBe('bg-red-500')
    })
  })

  describe('getFileUrl', () => {
    it('returns undefined for empty paths', () => {
      expect(getFileUrl()).toBeUndefined()
      expect(getFileUrl(null)).toBeUndefined()
    })

    it('keeps absolute urls unchanged', () => {
      expect(getFileUrl('https://example.com/image.png')).toBe(
        'https://example.com/image.png',
      )
    })

    it('resolves storage keys against the backend file endpoint', () => {
      expect(getFileUrl('tenants/abc/quiz_questions/image.png')).toBe(
        'https://api.example.com/api/v1/files/tenants/abc/quiz_questions/image.png?tenant=demo',
      )
      expect(getFileUrl('/tenants/abc/quiz_questions/image.png')).toBe(
        'https://api.example.com/api/v1/files/tenants/abc/quiz_questions/image.png?tenant=demo',
      )
    })
  })
})
