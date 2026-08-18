import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  username: string
  token: string
}

interface LoginStore {
  user: User | null
  setUser: (v: User | null) => void
  logout: () => void
}

export const useLoginStore = create<LoginStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (v) => set({ user: v }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'loggedUser',
    }
  )
)