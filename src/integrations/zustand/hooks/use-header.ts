import { create } from 'zustand'

export interface HeaderStore {
  title: string
}

export interface HeaderStoreActions {
  setTitle: (title: string) => void
}

export const useHeaderStore = create<HeaderStore & HeaderStoreActions>(
  (set) => ({
    title: '',
    setTitle: (title) => set({ title }),
  }),
)
