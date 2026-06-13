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
        payload = {
          name: data.name,
          email: data.email,
        }
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

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const response = await http.get(`/users/${userId}`)
    return response.data.data.user
  } catch (error) {
    toast.error('Failed to get user details')
    return null
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

export const getAllUsers = async (role?: string): Promise<Array<User>> => {
  try {
    const url = role ? `/users?role=${role}` : '/users'
    const response = await http.get(url)
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

export const getDeletedUsers = async (): Promise<Array<User>> => {
  try {
    const response = await http.get('/users/deleted')
    return response.data.data.users
  } catch (error) {
    toast.error('Failed to get deleted users')
    return []
  }
}

export const restoreUser = async (userId: number) => {
  try {
    await http.post(`/users/${userId}/restore`)
    toast.success('User restored successfully')
  } catch (error) {
    toast.error('Failed to restore user')
  }
}
