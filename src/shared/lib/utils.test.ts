import { describe, expect, it, vi } from 'vitest'

import { cn, getFileUrl } from './utils'

vi.mock('@/app/env', () => ({
  env: {
    VITE_IMAGE_BASE_URL: 'https://cdn.example.com',
    VITE_API_BASE_URL: 'https://api.example.com/api/v1',
  },
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

    it('resolves storage keys against the public image base', () => {
      expect(getFileUrl('tenants/abc/quiz_questions/image.png')).toBe(
        'https://cdn.example.com/tenants/abc/quiz_questions/image.png',
      )
      expect(getFileUrl('/tenants/abc/quiz_questions/image.png')).toBe(
        'https://cdn.example.com/tenants/abc/quiz_questions/image.png',
      )
    })
  })
})
