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
  session_date: string
  session_time: string
  duration: number // in minutes
  student_id: string
  student: User,
  mentor_id: string
  mentor: User,
  description: string
  note: string | null 
  status: 'pending' | 'completed' | 'cancelled'
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

export interface Article {
  id: number
  title: string
  content: string
  author_id: number
  author: User
  created_at: string
  updated_at: string
}
