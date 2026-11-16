export interface User {
  id: number
  name: string
  email: string
  email_verified_at: string
  is_active: boolean
  is_owner: boolean
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
  subject?: string
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
  author_name: string
  author_email: string
  author_role: string
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
  code: string
  description: string | null
  passing_score: number
  time_limit_minutes: number | null
  is_active: boolean
  scoring_method?: 'standard' | 'tka_irt_2pl'
  reporting_scale?: 'sd_smp' | 'sma_smk'
  created_at: string
  updated_at: string
}

export interface QuizOption {
  id: number
  question_id: number
  option_text: string
  image_url?: string | null
  is_correct: boolean
  order_number: number
  created_at: string
  updated_at: string
}

export interface QuizQuestion {
  id: number
  quiz_id: number
  question_text: string
  image_url?: string | null
  order_number: number
  options: Array<QuizOption>
  discrimination?: number | null
  difficulty?: number | null
  calibration_status?: 'calibrated' | 'uncalibrated' | 'simulated'
  calibration_version?: string | null
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
  scoring_method?: 'standard' | 'tka_irt_2pl'
  estimated_theta?: number | null
  transformed_score?: number | null
  achievement_category?: string | null
  calibration_version?: string | null
  started_at: string
  submitted_at: string | null
  reset_at: string | null
  reset_by: number | null
  created_at: string
  updated_at: string
  user_name: string
  user_email: string
}

export interface Program {
  id: number
  image_url: string | null
  title: string
  description: string
  created_at: string
  updated_at: string
}

export interface Testimonial {
  id: number
  testimoner_name: string
  testimoner_position: string
  testimoner_photo: string | null
  testimony_text: string
  is_active: boolean
  gender: 'man' | 'woman' | 'man-woman'
  created_at: string
  updated_at: string
}
