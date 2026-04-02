import loginServices from '../services/login'
import { setUnauthorizedHandler } from '@/services/axiosInstance'
import { useState, useEffect } from 'react'

const useAuth = () => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('loggedUser')
    return saved ? JSON.parse(saved) : null
  })

  // re-register handler on page refresh if user is already logged in
  useEffect(() => {
    if (user) {
      setUnauthorizedHandler(logout)
    }
  }, [])

  const login = async (credentials) => {
    try {
      const user = await loginServices.login(credentials)
      setUser(user)
      localStorage.setItem('loggedUser', JSON.stringify(user))
      setUnauthorizedHandler(logout)
    } catch(error) {
        const message = error.response?.data?.error
        throw new Error(message)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('loggedUser')
    setUnauthorizedHandler(null)
  }

  return {
    user,
    login,
    logout
  }
}

export default useAuth
