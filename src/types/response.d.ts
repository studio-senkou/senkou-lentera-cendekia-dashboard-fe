export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'mentor'
  created_at: string
  updated_at: string
}
