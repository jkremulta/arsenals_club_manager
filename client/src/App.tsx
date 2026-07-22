import { Routes, Route } from 'react-router-dom'
import Dashboard from './Dashboard'
import { LoginForm } from '@/LoginForm'
import { Toaster } from "@/components/retroui/Sonner"
import { useLoginStore } from './stores/useLoginStore'
import NotFound from './components/NotFound'

const App = () => {
  const { user } = useLoginStore()

  return (
    <>
      <Toaster position="top-right" />

      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Dashboard user={user} />
            ) : (
              <div className="flex min-h-screen items-center justify-center">
                <LoginForm />
              </div>
            )
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App