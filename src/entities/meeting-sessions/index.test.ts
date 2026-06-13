import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getPublicMeetingSessionByUser } from './index'
import { http } from '@/shared/lib/axios'
import { toast } from 'sonner'

vi.mock('@/shared/lib/axios', () => ({
  http: {
    get: vi.fn(),
  },
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('Meeting Sessions Entity API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getPublicMeetingSessionByUser', () => {
    it('should fetch public meeting sessions successfully', async () => {
      const mockData = {
        data: {
          data: {
            student: { id: 1, name: 'John Doe' },
            sessions: [],
          },
        },
      }
      vi.mocked(http.get).mockResolvedValueOnce(mockData)

      const result = await getPublicMeetingSessionByUser('1')

      expect(http.get).toHaveBeenCalledWith('/public/meeting-sessions/1')
      expect(result).toEqual(mockData.data.data)
      expect(toast.error).not.toHaveBeenCalled()
    })

    it('should show error toast on failure', async () => {
      vi.mocked(http.get).mockRejectedValueOnce(new Error('Network error'))

      const result = await getPublicMeetingSessionByUser('1')

      expect(http.get).toHaveBeenCalledWith('/public/meeting-sessions/1')
      expect(result).toBeUndefined()
      expect(toast.error).toHaveBeenCalledWith('Gagal mengambil data sesi meeting publik')
    })
  })
})
