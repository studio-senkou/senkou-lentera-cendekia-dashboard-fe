export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'mentor'
  created_at: string
  updated_at: string
}

export interface MeetingSession {
  id: string
  session_topic: string
  session_date: string
  session_time: string
  session_duration: number // in minutes
  session_type: string
  session_description?: string
  student_id: string
  mentor_id: string
  session_proof?: string
  student_attendance_proof?: string
  mentor_attendance_proof?: string
  student: User
  mentor: User
  session_status: 'scheduled' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}
