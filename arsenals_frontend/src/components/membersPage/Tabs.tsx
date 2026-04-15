import { Users, Shield } from 'lucide-react'


const Tabs = ({ setActiveTab, activeTab }) => {
  return (
    <div className="flex-shrink-0 border-b border-border">
        <div className="mx-auto flex max-w-4xl px-4 md:px-8">
          {[
            { id: 'players', label: 'Players', icon: Users },
            { id: 'teams',   label: 'Teams',   icon: Shield },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-[13px] font-medium transition-colors ${
                activeTab === id
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
    </div>
  )
}

export default Tabs