import Cookies from 'js-cookie'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface UserStore {
  name: string | null
  email: string | null
  role: 'user' | 'mentor' | 'admin' | null
}

export interface UserStoreActions {
  setUser: (user: UserStore) => void
  clearUser: () => void
}

export const useUserStore = create<UserStore & UserStoreActions>()(
  persist(
    (set) => ({
      name: null,
      email: null,
      role: null,

      setUser: (user: UserStore) =>
        set(() => ({
          name: user.name,
          email: user.email,
          role: user.role,
        })),

      clearUser: () =>
        set(() => ({
          name: null,
          email: null,
          role: null,
        })),
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const cookie = Cookies.get(name)
          return cookie ? JSON.parse(cookie) : null
        },
        setItem: (name, value) => {
          Cookies.set(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          Cookies.remove(name)
        },
      })),
    },
  ),
)
