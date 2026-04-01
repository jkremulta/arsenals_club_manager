import { useState } from 'react'
import loginServices from './services/login'
import { LoginForm } from '@/LoginForm'
import Dashboard from './Dashboard'

const App = () => {
  const [user, setUser] = useState(() => {
    const loggedUserJSON = localStorage.getItem('loggedUser')
    return loggedUserJSON ? JSON.parse(loggedUserJSON) : null
  })

  const handleLogin = async ({ username, password }) => {
    try {
      const user = await loginServices.login({ username, password })
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
  
  if (user) return <Dashboard onLogout={handleLogout} user={user}/>

  // login form
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoginForm className='w-96' onSubmit={handleLogin}/>
    </div>
  )
  
}


export default App