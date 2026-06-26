import { Button } from '@/components/retroui/Button'
import { useState } from 'react'
import { Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import arsenalsLogo from './components/icons/arsenals logo transparent.png'

import { useLogin } from './hooks/useLogin'
import { useManualAttendance } from './hooks/useManualAttendance'

export function LoginForm() {
  const [tab, setTab] = useState<'login' | 'attendance'>('login')

  // login fields
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // attendance UI state
  const [nameQuery, setNameQuery] = useState('')
  const [checkedIn, setCheckedIn] = useState(false)

  const { loginMutation } = useLogin()

  const { handleCheckIn, loading: checkingIn } = useManualAttendance()

  // ── LOGIN ──
 const handleLoginSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  try {
    await loginMutation.mutateAsync({
      username: username.trim(),
      password: password.trim(),
    })
  } catch (error) {
    
  }
}

  // ── ATTENDANCE ──
  const submitAttendance = async () => {
    const success = await handleCheckIn(nameQuery)

    if (success) {
      setCheckedIn(true)
      setNameQuery('')
    }
  }

  const inputClass =
    'w-full border-2 border-black bg-card px-3 py-2.5 text-sm text-foreground ' +
    'placeholder:text-muted-foreground/50 outline-none shadow-[2px_2px_0px_0px_#000] ' +
    'focus:shadow-[3px_3px_0px_0px_#000] transition-shadow'

  return (
    <div className={'w-full max-w-sm px-4 w-96'}>
      <div className="border-2 border-black bg-background p-6 shadow-[6px_6px_0px_0px_#000]">

        {/* Logo */}
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center">
            <img src={arsenalsLogo} className="h-full w-full object-contain" />
          </div>

          <div className="text-center">
            <h1 className="font-head text-[18px] font-bold">
              Arsenal Tchoukball Club
            </h1>
            <p className="text-[13px] text-muted-foreground">
              {tab === 'login'
                ? 'Sign in to your account'
                : "Check yourself in for today's session"}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-5 flex gap-2 vg">
          {(['login', 'attendance'] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t)
                setCheckedIn(false)
              }}
              className={
                'flex-1 bg-card border-2 border-black py-1.5 text-[13px] font-medium capitalize ' +
                (tab === t
                  ? 'bg-primary text-primary-foreground shadow-[3px_3px_0px_0px_#000]'
                  : 'bg-background text-foreground shadow-[3px_3px_0px_0px_#000]')
              }
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── LOGIN TAB ── */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3">

            {/* username */}
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className={inputClass}
              autoComplete="username"
            />

            {/* password */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className={inputClass}
                autoComplete="current-password"
              />

              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* submit */}
            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-emerald-400 text-black"
            >
              {loginMutation.isPending && (
                <Loader2 size={16} className="mr-2 animate-spin" />
              )}
              Sign in
            </Button>

            {/* error */}
            {loginMutation.error && (
              <p className="text-center text-sm text-red-500">
                 {loginMutation.error.response?.data?.error || loginMutation.error.message}
              </p>
            )}
          </form>
        )}

        {/* ── ATTENDANCE TAB ── */}
        {tab === 'attendance' && (
          <div className="flex flex-col gap-3">

            {checkedIn ? (
              <div className="flex flex-col items-center gap-2 text-center py-4">
                <CheckCircle2 className="mx-auto text-emerald-500" size={40} />
                <p className="mt-2">You're checked in!</p>

                <Button
                  size="sm"
                  onClick={() => setCheckedIn(false)}
                  className="mt-3 bg-emerald-400"
                >
                  Done
                </Button>
              </div>
            ) : (
              <>
                <input
                  value={nameQuery}
                  onChange={(e) => setNameQuery(e.target.value)}
                  placeholder="Your name"
                  className={inputClass}
                />

                <Button
                  onClick={submitAttendance}
                  disabled={!nameQuery.trim() || checkingIn}
                  className="w-full bg-emerald-400 text-black"
                >
                  {checkingIn && (
                    <Loader2 size={16} className="mr-2 animate-spin" />
                  )}
                  Check in
                </Button>
              </>
            )}

          </div>
        )}

      </div>
    </div>
  )
}