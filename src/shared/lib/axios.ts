import axios from 'axios'
import { toast } from 'sonner'
import { useSessionStore } from '@/shared/hooks/use-session'
import { env } from '@/app/env'

export const http = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

http.interceptors.request.use(
  (config) => {
    const { accessToken } = useSessionStore.getState()

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

http.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    if (!originalRequest) {
      return Promise.reject(error)
    }

    // ponytail: prevent infinite loop if the auth requests themselves fail
    if (
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/logout')
    ) {
      return Promise.reject(error)
    }

    const { clearLocalSession } = useSessionStore.getState()

    if (error.response?.status === 401) {
      if (window.location.pathname !== '/login') {
        toast.error('Session expired. Please log in again.')
        clearLocalSession()
        window.location.href = '/login'
      }
      return Promise.reject(error)
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.')
      return Promise.reject(error)
    }

    return Promise.reject(error)
  },
)
