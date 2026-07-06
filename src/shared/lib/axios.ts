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

let retryCountMap = new WeakMap<any, number>()
let refreshPromise: Promise<any> | null = null

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

    const { refreshToken, renewSession, clearLocalSession } =
      useSessionStore.getState()

    if (error.response?.status === 401) {
      let retries = retryCountMap.get(originalRequest) || 0

      if (retries >= 2) {
        if (window.location.pathname !== '/login') {
          toast.error('Session expired. Please log in again.')
          clearLocalSession()
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }

      if (refreshToken) {
        retryCountMap.set(originalRequest, retries + 1)
        try {
          // ponytail: share a single refresh promise for concurrent requests
          if (!refreshPromise) {
            refreshPromise = renewSession().finally(() => {
              refreshPromise = null
            })
          }
          const data = await refreshPromise
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`
          return await http.request(originalRequest)
        } catch (renewError) {
          if (window.location.pathname !== '/login') {
            toast.error('Failed to renew session. Please log in again.')
            clearLocalSession()
            window.location.href = '/login'
          }
          return Promise.reject(renewError)
        }
      } else {
        if (window.location.pathname !== '/login') {
          toast.error('Session expired. Please log in again.')
          clearLocalSession()
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.')
      return Promise.reject(error)
    }

    return Promise.reject(error)
  },
)
