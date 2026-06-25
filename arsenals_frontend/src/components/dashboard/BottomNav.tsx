import { Users, Play, Zap } from 'lucide-react'
import { useUIStore } from '@/stores/useUIStore'
import { Button } from '@/components/retroui/Button'

const NAV_TABS = [
  { id: 'attendance', label: 'Attendance', icon: Users },
  { id: 'game', label: 'Game', icon: Play },
  { id: 'controls', label: 'Controls', icon: Zap },
]

const BottomNav = () => {
  const { activeTab, setActiveTab } = useUIStore()

  return (
    <div className="flex flex-shrink-0 gap-5 text-muted-foreground border-black bg-background pb-3 pt-1 px-4 md:hidden">
      {NAV_TABS.map(({ id, icon: Icon }) => {
        const isActive = activeTab === id

        return (
          <Button
            key={id}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab(id)}
            className={`
              border-2 bg-card border-black flex-1 flex-col gap-1 rounded-none py-3
              ${isActive ? 'bg-primary text-white' : ''}
            `}
          >
            <Icon size={16} />
          </Button>
        )
      })}
    </div>
  )
}

export default BottomNav