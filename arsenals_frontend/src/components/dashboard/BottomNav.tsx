import {
  Users,
  Play,
  Zap,
} from 'lucide-react'

import { useUIStore } from '@/stores/useUIStore'

const NAV_TABS = [
  { id: 'attendance', label: 'Attendance', icon: Users },
  { id: 'game',       label: 'Game',       icon: Play },
  { id: 'controls',  label: 'Controls',   icon: Zap },
]
 
const BottomNav = () => {
  const { activeTab, setActiveTab } = useUIStore()

  return (
    <div className="flex flex-shrink-0 border-t border-border bg-background md:hidden">
      {NAV_TABS.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id
        return (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="flex flex-1 flex-col items-center gap-1 py-3"
          >
            <div className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${isActive ? 'bg-emerald-500/20' : 'bg-card'}`}>
              <Icon size={13} className={isActive ? 'text-emerald-400' : 'text-muted-foreground'} />
            </div>
            <span className={`text-[9px] font-medium ${isActive ? 'text-emerald-400' : 'text-muted-foreground'}`}>
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default BottomNav