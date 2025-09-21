import { toast } from 'sonner'
import type { User } from '@/shared/types/response'
import { http } from '@/shared/lib/axios'

interface RegisterUserRequest {
  name: string
  email: string
  role: 'user' | 'mentor'
  classes: Array<string>
  minimal_sessions?: number
}

export const registerUser = async (data: RegisterUserRequest) => {
  try {
    let payload = {}

    const url = data.role === 'mentor' ? '/users/mentors' : '/users'

    switch (data.role) {
      case 'user':
        payload = {
          ...data,
          classes: undefined,
          minimal_sessions: data.minimal_sessions,
          class: data.classes[0]
        }
        break
      case 'mentor':
        delete data.minimal_sessions
        payload = data
        break
    }

    const response = await http.post(url, payload)

    toast.success('User registered successfully')
    return response.data
  } catch (error) {
    toast.error('Failed to register user')
    throw error
  }
}

export const forceActivateUser = async (userID: number) => {
  try {
    const response = await http.post(`/users/${userID}/force-activate`)

    toast.success('Successfully activate user')
    return response.data.data
  } catch (error) {
    toast.error('Failed to activate user status')
  }
}

export const getUserDetails = async (): Promise<User | null> => {
  try {
    const response = await http.get('/users/me')
    const user = response.data.data.user

    return {
      ...user,
      role:
        user.role === 'mentor'
          ? 'Mentor'
          : user.role === 'student'
            ? 'Murid'
            : 'Admin',
    }
  } catch (error) {
    toast.error('Failed to get user details')
    return null
  }
}

export const getUserCount = async (): Promise<{
  mentor: number
  student: number
} | null> => {
  try {
    const response = await http.get('/active-user')
    return response.data.data.users
  } catch (error) {
    return null
  }
}

export const getAllUsers = async (): Promise<Array<User>> => {
  try {
    const response = await http.get('/users')
    return response.data.data.users
  } catch (error) {
    toast.error('Failed to get users')
    return []
  }
}

export const getUserDropdown = async (): Promise<Array<User>> => {
  try {
    const response = await http.get('/users/students/dropdown')
    return response.data.data.users ?? []
  } catch (error) {
    toast.error('Failed to get user dropdown')
    return []
  }
}

export const getMentorDropdown = async (): Promise<Array<User>> => {
  try {
    const response = await http.get('/users/mentors/dropdown')
    return response.data.data.mentors ?? []
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
