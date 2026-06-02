import { create } from 'zustand'

const getDefaultStartTime = () => {
  const now = new Date()
  now.setSeconds(0, 0)
  return now.toTimeString().slice(0, 5)
}

export const useUIStore = create((set) => ({
  skillGroup: '',
  createOpen: false,
  drawerOpen: false,
  activeTab: 'attendance',
  startTime: getDefaultStartTime(),

  setSkillGroup: (v) => set({ skillGroup: v }),
  setCreateOpen: (v) => set({ createOpen: v }),
  setDrawerOpen: (v) => set({ drawerOpen: v }),
  setActiveTab: (v) => set({ activeTab: v }),
  setStartTime: (v) => set({ startTime: v }),
}))