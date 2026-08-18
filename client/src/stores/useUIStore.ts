import { create } from 'zustand'

const getDefaultStartTime = (): string => {
  const now = new Date()
  now.setSeconds(0, 0)
  return now.toTimeString().slice(0, 5)
}


type SkillGroup = '' | 'beginner' | 'intermediate' | 'advanced'
type ActiveTab = 'attendance' | 'game' | 'controls'

interface UIStore {
  skillGroup: SkillGroup
  createSessionOpen: boolean
  endSessionOpen: boolean
  membersFormOpen: boolean
  membersTabOpen: boolean
  filterOpen: boolean
  drawerOpen: boolean
  activeTab: ActiveTab
  startTime: string

  setSkillGroup: (v: SkillGroup) => void
  setCreateSessionOpen: (v: boolean) => void
  setEndSessionOpen: (v: boolean) => void
  setMembersFormOpen: (v: boolean) => void
  setMembersTabOpen: (v: boolean) => void
  setFilterOpen: (v: boolean) => void
  setDrawerOpen: (v: boolean) => void
  setActiveTab: (v: ActiveTab) => void
  setStartTime: (v: string) => void
}

export const useUIStore = create<UIStore>((set) => ({
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