import { create } from 'zustand'

const getDefaultStartTime = () => {
  const now = new Date()
  now.setSeconds(0, 0)
  return now.toTimeString().slice(0, 5)
}

export const useUIStore = create((set) => ({
  skillGroup: '',
  createSessionOpen: false,
  endSessionOpen: false,
  membersFormOpen: false,
  membersTabOpen: false,
  filterOpen: false,
  drawerOpen: false,
  activeTab: 'attendance',
  startTime: getDefaultStartTime(),

  setSkillGroup: (v) => set({ skillGroup: v }),
  setCreateSessionOpen: (v) => set({ createSessionOpen: v }),
  setEndSessionOpen: (v) => set({ endSessionOpen: v }),
  setMembersFormOpen: (v) => set({ membersFormOpen: v }),
  setMembersTabOpen: (v) => set({ membersTabOpen: v }),
  setFilterOpen: (v) => set({ filterOpen: v }),
  setDrawerOpen: (v) => set({ drawerOpen: v }),
  setActiveTab: (v) => set({ activeTab: v }),
  setStartTime: (v) => set({ startTime: v }),
}))