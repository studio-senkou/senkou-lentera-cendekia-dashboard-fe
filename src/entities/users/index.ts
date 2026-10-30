import { toast } from 'sonner'
import type { User } from '@/shared/types/response'
import type {
  PaginationMeta,
  PaginationParams,
} from '@/shared/types/pagination'
import { http } from '@/shared/lib/axios'

interface RegisterUserRequest {
  name: string
  email: string
  role: 'user' | 'mentor' | 'admin'
  classes: Array<string>
  minimal_sessions?: number
}

export const registerUser = async (data: RegisterUserRequest) => {
  try {
    let payload = {}

    const url =
      data.role === 'mentor'
        ? '/users/mentors'
        : data.role === 'admin'
          ? '/users/admins'
          : '/users'

    switch (data.role) {
      case 'user':
        payload = {
          ...data,
          classes: undefined,
          minimal_sessions: data.minimal_sessions,
          class: data.classes[0],
        }
        break
      case 'mentor':
        payload = {
          name: data.name,
          email: data.email,
        }
        break
      case 'admin':
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
  } catch {
    toast.error('Failed to activate user status')
  }
}

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const response = await http.get(`/users/${userId}`)
    return response.data.data.user
  } catch {
    toast.error('Failed to get user details')
    return null
  }
}

export const getUserDetails = async (): Promise<User | null> => {
  try {
    const response = await http.get('/users/me')
    return response.data.data.user
  } catch {
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
  } catch {
    return null
  }
}

export const getAllUsers = async (
  role?: string,
  pagination?: PaginationParams,
): Promise<{ users: Array<User>; meta?: PaginationMeta }> => {
  try {
    const response = await http.get('/users', {
      params: {
        ...(role ? { role } : {}),
        ...pagination,
      },
    })
    return {
      users: response.data.data.users ?? [],
      meta: response.data.meta,
    }
  } catch {
    toast.error('Failed to get users')
    return { users: [] }
  }
}

export const getUserDropdown = async (): Promise<Array<User>> => {
  try {
    const response = await http.get('/users/students/dropdown')
    return response.data.data.users ?? []
  } catch {
    toast.error('Failed to get user dropdown')
    return []
  }
}

export const getMentorDropdown = async (): Promise<Array<User>> => {
  try {
    const response = await http.get('/users/mentors/dropdown')
    return response.data.data.mentors ?? []
  } catch {
    toast.error('Failed to get mentor dropdown')
    return []
  }
}

export const deleteUser = async (userId: number) => {
  try {
    await http.delete(`/users/${userId}`)
    toast.success('User deleted successfully')
  } catch {
    toast.error('Failed to delete user')
  }
}

export const getDeletedUsers = async (
  pagination?: PaginationParams,
): Promise<{ users: Array<User>; meta?: PaginationMeta }> => {
  try {
    const response = await http.get('/users/deleted', {
      params: pagination ?? undefined,
    })
    return {
      users: response.data.data.users ?? [],
      meta: response.data.meta,
    }
  } catch {
    toast.error('Failed to get deleted users')
    return { users: [] }
  }
}

export const restoreUser = async (userId: number) => {
  try {
    await http.post(`/users/${userId}/restore`)
    toast.success('User restored successfully')
  } catch {
    toast.error('Failed to restore user')
  }
}
