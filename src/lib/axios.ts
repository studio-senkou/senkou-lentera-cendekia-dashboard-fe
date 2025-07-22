import axios from 'axios'
import { useSessionStore } from '@/integrations/zustand/hooks/use-session'
import { env } from '@/env'

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
  (error) => {
    console.log(error)
  },
)
