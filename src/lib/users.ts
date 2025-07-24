import { toast } from 'sonner'
import { http } from './axios'

interface RegisterUserRequest {
  name: string
  email: string
  role: 'user' | 'mentor'
}

export const registerUser = async (data: RegisterUserRequest) => {
  try {
    const url = data.role === 'mentor' ? '/users/mentors' : '/users'
    const response = await http.post(url, data)

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

export const getUserDropdown = async () => {
  try {
    const response = await http.get('/users/students/dropdown')
    return response.data
  } catch (error) {
    toast.error('Failed to get user dropdown')
    return []
  }
}

export const getMentorDropdown = async () => {
  try {
    const response = await http.get('/users/mentors/dropdown')
    return response.data
  } catch (error) {
    toast.error('Failed to get mentor dropdown')
    return []
  }
}

export const deleteUser = async (userId: number) => {
  try {
    await http.delete(`/users/${userId}`)
    toast.success('User deleted successfully')
  } catch (error) {
    toast.error('Failed to delete user')
  }
}
