import { Routes, Route } from 'react-router-dom'
import MembersPage from './MembersPage'
import Dashboard from './Dashboard'
import useAuth from './hooks/useAuth'
import { LoginForm } from '@/LoginForm'
import { Toaster } from '@/components/ui/sonner'

const App = () => {
  const { user, login, logout } = useAuth()

  if (!user) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <div className="flex min-h-screen items-center justify-center">
          <LoginForm className="w-96" onSubmit={login} />
        </div>
      </>
    )
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<Dashboard onLogout={logout} user={user} />} />
        <Route path="/members" element={<MembersPage user={user} />} />
      </Routes>
    </>
  )
}

export default App