import {
  Users,
  Play,
  Zap,
} from 'lucide-react'

const NAV_TABS = [
  { id: 'attendance', label: 'Attendance', icon: Users },
  { id: 'game',       label: 'Game',       icon: Play },
  { id: 'controls',  label: 'Controls',   icon: Zap },
]
 
function BottomNav({ active, onChange }) {
  return (
    <div className="flex flex-shrink-0 border-t border-white/[0.08] bg-[#111] md:hidden">
      {NAV_TABS.map(({ id, label, icon: Icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="flex flex-1 flex-col items-center gap-1 py-3"
          >
            <div className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${isActive ? 'bg-emerald-500/20' : 'bg-white/[0.07]'}`}>
              <Icon size={13} className={isActive ? 'text-emerald-400' : 'text-white/30'} />
            </div>
            <span className={`text-[9px] font-medium ${isActive ? 'text-emerald-400' : 'text-white/30'}`}>
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default BottomNav