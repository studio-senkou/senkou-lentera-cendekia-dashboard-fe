import { toast } from 'sonner'
import { http } from './axios'

export interface CreateMeetingSessionRequest {
  student_id: number
  mentor_id: number
  date: string
  time: string
  duration: number
  topic: string
  type: string
  description?: string
}

export interface UpdateMeetingSessionRequest {
  id: number
  data: Partial<Omit<CreateMeetingSessionRequest, 'student_id' | 'mentor_id'>>
}

export const createMeetingSession = async (
  data: CreateMeetingSessionRequest,
) => {
  try {
    const response = await http.post('/meeting-sessions', data)
    toast.success('Sesi pertemuan berhasil dibuat')
    return response.data
  } catch (error) {
    toast.error('Failed to create meeting session')
  }
}

export const getMeetingSessions = async (filters = {}) => {
  try {
    const response = await http.get('/meeting-sessions', { params: filters })
    return response.data.data.sessions
  } catch (error) {
    toast.error('Failed to get meeting sessions')
  }
}

export const updateMeetingSession = async ({
  id,
  data,
}: UpdateMeetingSessionRequest) => {
  try {
    const response = await http.put(`/meeting-sessions/${id}`, data)
    toast.success('Sesi pertemuan berhasil diperbarui')
    return response.data
  } catch (error) {
    toast.error('Failed to update meeting session')
  }
}

export const completeMeetingSession = async (id: number) => {
  try {
    const response = await http.patch(`/meeting-sessions/${id}/complete`)
    toast.success('Sesi pertemuan berhasil diselesaikan')
    return response.data
  } catch (error) {
    toast.error('Failed to complete meeting session')
  }
}

export const cancelMeetingSession = async (id: number) => {
  try {
    const response = await http.patch(`/meeting-sessions/${id}/cancel`)
    toast.success('Sesi pertemuan berhasil dibatalkan')
    return response.data
  } catch (error) {
    toast.error('Failed to cancel meeting session')
  }
}

export const deleteMeetingSession = async (id: number) => {
  try {
    const response = await http.delete(`/meeting-sessions/${id}`)
    toast.success('Sesi pertemuan berhasil dihapus')
    return response.data
  } catch (error) {
    toast.error('Failed to delete meeting session')
  }
}
