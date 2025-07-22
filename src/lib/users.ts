import { toast } from 'sonner'
import { http } from './axios'

interface RegisterUserRequest {
  name: string
  email: string
}

export const registerUser = async (data: RegisterUserRequest) => {
  try {
    const response = await http.post('/users', data)

    toast.success('User registered successfully')
    return response.data
  } catch (error) {
    toast.error('Failed to register user')
  }
}

export const getAllUsers = async () => {
  try {
    const response = await http.get('/users')
    return response.data
  } catch (error) {
    toast.error('Failed to get users')
  }
}
