import { create } from 'zustand'
import Cookies from 'js-cookie'
import { http } from '@/lib/axios'
import { toast } from 'sonner'

interface SessionState {
  accessToken: string | null
  refreshToken: string | null
}

interface UpdateSessionData {
  access_token?: string
  refresh_token?: string
  access_token_expiry?: string
  refresh_token_expiry?: string
}

interface SessionActions {
  authenticate: (email: string, password: string) => Promise<void>
  renewSession: () => Promise<UpdateSessionData>
  updateSession: (data: UpdateSessionData) => void
  setAccessToken: (token: string) => void
  setRefreshToken: (token: string) => void
  clearSession: () => Promise<void>
}

export const useSessionStore = create<SessionState & SessionActions>()(
  (set, get) => ({
    accessToken: Cookies.get('access_token') || null,
    refreshToken: Cookies.get('refresh_token') || null,
    authenticate: async (email, password) => {
      try {
        const response = await http.post('/auth/login', {
          email,
          password,
        })

        get().updateSession(response.data.data)
        toast.success('Login success')
      } catch (error) {
        throw new Error('Authentication failed')
      }
    },
    renewSession: async () => {
      try {
        const { refreshToken, updateSession } = get()

        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const response = await http.put('/auth/refresh', {
          token: refreshToken,
        })

        console.log('Session renewed:', response.data.data)

        updateSession(response.data.data)
        return response.data.data;
      } catch (error) {
        toast.error('Failed to renew session')
        throw new Error('Failed to renew session')
      }
    },
    updateSession: ({
      access_token,
      refresh_token,
      access_token_expiry,
      refresh_token_expiry,
    }: UpdateSessionData) => {
      if (access_token) {
        Cookies.set('access_token', access_token, {
          expires: new Date(
            access_token_expiry || Date.now() + 7 * 24 * 60 * 60 * 1000,
          ),
        })
        set({ accessToken: access_token })
      }

      if (refresh_token) {
        Cookies.set('refresh_token', refresh_token, {
          expires: new Date(
            refresh_token_expiry || Date.now() + 7 * 24 * 60 * 60 * 1000,
          ),
        })
        set({ refreshToken: refresh_token })
      }
    },
    setAccessToken: (token: string) => {
      Cookies.set('access_token', token, { expires: 7 })
      set({ accessToken: token })
    },
    setRefreshToken: (token: string) => {
      Cookies.set('refresh_token', token, { expires: 7 })
      set({ refreshToken: token })
    },
    clearSession: async () => {
      try {
        await http.delete('/auth/logout')
      } catch (error) {
        throw new Error('Failed to logged out')
      }

      Cookies.remove('access_token')
      Cookies.remove('refresh_token')
      set({ accessToken: null, refreshToken: null })
    },
  }),
)
