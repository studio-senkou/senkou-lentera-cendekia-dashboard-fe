import { create } from 'zustand'
import Cookies from 'js-cookie'
import { http } from '@/shared/lib/axios'
import { toast } from 'sonner'
import { useUserStore } from '@/shared/hooks/use-user'

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
  clearLocalSession: () => void
}

const ACCESS_TOKEN_FALLBACK_MS = 24 * 60 * 60 * 1000
const REFRESH_TOKEN_FALLBACK_MS = 90 * 24 * 60 * 60 * 1000

let renewPromise: Promise<UpdateSessionData> | null = null

export const useSessionStore = create<SessionState & SessionActions>()(
  (set, get) => ({
    accessToken: Cookies.get('access_token') || null,
    refreshToken: Cookies.get('refresh_token') || null,
    authenticate: async (email, password) => {
      try {
        const response = await http.post('/auth/login/admin', {
          email,
          password,
        })

        get().updateSession(response.data.data)
        toast.success('Login success')
      } catch {
        toast.error('Failed to logged in')
        throw new Error('Authentication failed')
      }
    },
    renewSession: async () => {
      if (renewPromise) return renewPromise

      const pending = (async () => {
        try {
          const { updateSession } = get()
          const refreshToken =
            Cookies.get('refresh_token') || get().refreshToken

          if (!refreshToken) {
            throw new Error('No refresh token available')
          }

          const response = await http.put('/auth/refresh', {
            token: refreshToken,
          })

          updateSession(response.data.data)
          return response.data.data as UpdateSessionData
        } catch (error) {
          Cookies.remove('access_token')
          Cookies.remove('refresh_token')
          set({ accessToken: null, refreshToken: null })
          useUserStore.getState().clearUser()
          throw error
        }
      })()

      renewPromise = pending

      try {
        return await pending
      } finally {
        renewPromise = null
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
            access_token_expiry || Date.now() + ACCESS_TOKEN_FALLBACK_MS,
          ),
        })
        set({ accessToken: access_token })
      }

      if (refresh_token) {
        Cookies.set('refresh_token', refresh_token, {
          expires: new Date(
            refresh_token_expiry || Date.now() + REFRESH_TOKEN_FALLBACK_MS,
          ),
        })
        set({ refreshToken: refresh_token })
      }
    },
    setAccessToken: (token: string) => {
      Cookies.set('access_token', token, {
        expires: new Date(Date.now() + ACCESS_TOKEN_FALLBACK_MS),
      })
      set({ accessToken: token })
    },
    setRefreshToken: (token: string) => {
      Cookies.set('refresh_token', token, {
        expires: new Date(Date.now() + REFRESH_TOKEN_FALLBACK_MS),
      })
      set({ refreshToken: token })
    },
    clearSession: async () => {
      try {
        await http.delete('/auth/logout')
        toast.success('Logged out successfully')
      } catch (error) {
        // ponytail: log error but don't prevent local cleanup
        console.error('Failed to logout on backend:', error)
      } finally {
        Cookies.remove('access_token')
        Cookies.remove('refresh_token')
        set({ accessToken: null, refreshToken: null })
        useUserStore.getState().clearUser()
      }
    },
    clearLocalSession: () => {
      Cookies.remove('access_token')
      Cookies.remove('refresh_token')
      set({ accessToken: null, refreshToken: null })
      useUserStore.getState().clearUser()
    },
  }),
)
