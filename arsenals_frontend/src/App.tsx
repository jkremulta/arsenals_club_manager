import { Routes, Route } from 'react-router-dom'
import MembersPage from './MembersPage'
import Dashboard from './Dashboard'
import { LoginForm } from '@/LoginForm'
import { Toaster } from "@/components/retroui/Sonner"
import { useLoginStore } from './stores/useLoginStore'

const App = () => {
  const { user } = useLoginStore()

  if (!user) {
    return (
      <>
        <Toaster position="top-right"/>
        <div className="flex min-h-screen items-center justify-center">
          <LoginForm/>
        </div>
      </>
    )
  }

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Dashboard user={user} />} />
        <Route path="/members" element={<MembersPage user={user} />} />
      </Routes>
    </>
  )
}

export default App