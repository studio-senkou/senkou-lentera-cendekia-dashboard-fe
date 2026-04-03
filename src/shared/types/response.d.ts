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
  student: User
  mentor_id: string
  mentor: User
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

export interface Class {
  id: number
  classname: string
  created_at: string
  updated_at: string
}

export interface Quiz {
  id: number
  title: string
  description: string | null
  passing_score: number
  time_limit_minutes: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface QuizOption {
  id: number
  question_id: number
  option_text: string
  is_correct: boolean
  order_number: number
  created_at: string
  updated_at: string
}

export interface QuizQuestion {
  id: number
  quiz_id: number
  question_text: string
  order_number: number
  options: Array<QuizOption>
  created_at: string
  updated_at: string
}

export interface QuizDetail {
  quiz: Quiz
  questions: Array<QuizQuestion>
}

export interface QuizAttempt {
  id: number
  quiz_id: number
  user_id: number
  status: 'in_progress' | 'completed' | 'reset'
  score: number | null
  started_at: string
  submitted_at: string | null
  reset_at: string | null
  reset_by: number | null
  created_at: string
  updated_at: string
  user_name: string
  user_email: string
}
