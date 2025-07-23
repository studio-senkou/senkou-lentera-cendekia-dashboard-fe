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

export const getMeetingSessions = async () => {
  try {
    const response = await http.get('/meeting-sessions')
    return response.data
  } catch (error) {
    toast.error('Failed to get meeting sessions')
  }
}
