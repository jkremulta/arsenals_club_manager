import loginServices from '../services/login'
import { useState } from 'react'

const useAuth = () => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('loggedUser')
    return saved ? JSON.parse(saved) : null
  })

  const login = async (credentials) => {
    const user = await loginServices.login(credentials)
    setUser(user)
    localStorage.setItem('loggedUser', JSON.stringify(user))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('loggedUser')
  }

  return {
    user,
    login,
    logout
  }
}

export default useAuth
