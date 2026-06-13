import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('utils', () => {
  describe('cn', () => {
    it('should merge tailwind classes correctly', () => {
      expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white')
      expect(cn('p-4 p-8')).toBe('p-8')
      expect(cn('bg-red-500', false && 'text-white')).toBe('bg-red-500')
    })
  })
})
