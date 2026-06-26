import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useLoginStore = create(
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