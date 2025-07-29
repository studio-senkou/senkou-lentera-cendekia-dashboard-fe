export interface User {
  id: number
  name: string
  email: string
  email_verified_at: string
  is_active: boolean
  role: 'admin' | 'user' | 'mentor'
  created_at: string
  updated_at: string
}

export interface MeetingSession {
  id: number
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

export interface StaticAsset {
  id: number
  asset_name: string
  asset_type: 'image' | 'video' | 'document'
  asset_url: string
  created_at: string
  updated_at: string
}

export interface Testimony {
  id: number
  testimoner_name: string
  testimoner_current_position: string
  testimoner_previous_position: string
  testimony_text: string
  testimoner_photo?: string
  created_at: string
  updated_at: string
}
