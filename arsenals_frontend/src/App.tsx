import { LoginForm } from '@/LoginForm'
import Dashboard from './Dashboard'
import useAuth from './hooks/useAuth'

const App = () => {
  const { user, login, logout } = useAuth()
  
  if (user) return <Dashboard onLogout={logout} user={user}/>

  // login form
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoginForm className='w-96' onSubmit={login}/>
    </div>
  )
  
}


export default App