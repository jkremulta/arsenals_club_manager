import { Routes, Route } from 'react-router-dom'
import PlayersPage from './components/PlayersPage'
import Dashboard from './Dashboard'
import useAuth from './hooks/useAuth'
import { LoginForm } from '@/LoginForm'

const App = () => {
  const { user, login, logout } = useAuth()

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoginForm className="w-96" onSubmit={login} />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard onLogout={logout} user={user} />} />
      <Route path="/players" element={<PlayersPage user={user} />} />
    </Routes>
  )
}

export default App