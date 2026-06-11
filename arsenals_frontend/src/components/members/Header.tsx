import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Header = () => {
  const navigate = useNavigate()

  return (
    <header className="flex-shrink-0 border-b border-border px-4 py-3 md:px-8 md:py-4">
        <div className="relative mx-auto flex max-w-4xl items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={15} />
            Dashboard
          </button>
          <div className="absolute left-1/2 -translate-x-1/2">
            <h1 className="text-[14px] font-semibold tracking-tight">Members</h1>
          </div>
        </div>
  </header>
  )
}

export default Header
