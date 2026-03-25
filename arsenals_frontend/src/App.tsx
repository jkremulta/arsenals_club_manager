import { useState } from 'react'
import loginService from './services/login'
import { LoginForm } from '@/components/login-form'
import TrainingDashboard from '@/components/TrainingDashboard'

const App = () => {
  const [user, setUser] = useState(() => {
    const loggedUserJSON = localStorage.getItem('loggedUser')
    return loggedUserJSON ? JSON.parse(loggedUserJSON) : null
  })

  const handleLogin = async ({ username, password }) => {
    try {
      const user = await loginService.login({ username, password })
      setUser(user)
      localStorage.setItem('loggedUser', JSON.stringify(user))
    } catch {
      console.log('wrong credentials')
    }
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('loggedUser')
  }

  if (user) {
    return <TrainingDashboard onLogout={handleLogout} user={user} />
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoginForm className='w-96' onSubmit={handleLogin}/>
    </div>
  )
}

export default App