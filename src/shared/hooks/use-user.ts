import Cookies from 'js-cookie'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface UserStore {
  name: string | null
  email: string | null
  role: 'user' | 'mentor' | 'admin' | null
  isOwner: boolean
}

export interface UserIdentity {
  name: string
  email: string
  role: string
  is_owner?: boolean
}

export interface UserStoreActions {
  setUser: (user: UserIdentity) => void
  clearUser: () => void
}

function normalizeRole(role: string): UserStore['role'] {
  const normalized = role.toLowerCase()

  if (
    normalized === 'admin' ||
    normalized === 'mentor' ||
    normalized === 'user'
  ) {
    return normalized
  }

  return null
}

export const useUserStore = create<UserStore & UserStoreActions>()(
  persist(
    (set) => ({
      name: null,
      email: null,
      role: null,
      isOwner: false,

      setUser: (user: UserIdentity) =>
        set(() => ({
          name: user.name,
          email: user.email,
          role: normalizeRole(user.role),
          isOwner: user.is_owner === true,
        })),

      clearUser: () =>
        set(() => ({
          name: null,
          email: null,
          role: null,
          isOwner: false,
        })),
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          return Cookies.get(name) ?? null
        },
        setItem: (name, value) => {
          Cookies.set(name, value, { expires: 7 })
        },
        removeItem: (name) => {
          Cookies.remove(name)
        },
      })),
    },
  ),
)
