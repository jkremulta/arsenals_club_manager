import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useEffect, useRef, useState } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'
import arsenalsLogo from './components/icons/arsenals logo transparent.png'
import attendanceApi from './services/attendance'

// ── Types ─────────────────────────────────────────────────────────────────────

export function LoginForm({
  className,
  onSubmit,
  ...props
}: Omit<React.ComponentProps<'div'>, 'onSubmit'> & {
  onSubmit: (data: { username: string; password: string }) => void | Promise<void>
}) {
  const [tab, setTab] = useState<'login' | 'attendance'>('login')

  // ── Login state ────────────────────────────────────────────────────
  const [error, setError]               = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [username, setUsername]         = useState('')
  const [password, setPassword]         = useState('')
  const [revealedPasswordIndex, setRevealedPasswordIndex] = useState<number | null>(null)
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Attendance state ───────────────────────────────────────────────
  const [nameQuery, setNameQuery]         = useState('')
  const [searchError, setSearchError]     = useState('')
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkedIn, setCheckedIn]         = useState(false)

  // ── Password reveal helpers ────────────────────────────────────────
  const clearRevealTimeout = () => {
    if (!revealTimeoutRef.current) return
    clearTimeout(revealTimeoutRef.current)
    revealTimeoutRef.current = null
  }

  const scheduleMaskPassword = () => {
    clearRevealTimeout()
    revealTimeoutRef.current = setTimeout(() => {
      setRevealedPasswordIndex(null)
      revealTimeoutRef.current = null
    }, 800)
  }

  useEffect(() => () => clearRevealTimeout(), [])

  const displayPassword = password
    .split('')
    .map((char, index) => (index === revealedPasswordIndex ? char : '•'))
    .join('')

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextDisplayValue = e.target.value
    const nextLen = nextDisplayValue.length
    const prevLen = password.length

    if (!nextDisplayValue.includes('•')) {
      setPassword(nextDisplayValue)
      setRevealedPasswordIndex(nextDisplayValue.length - 1)
      scheduleMaskPassword()
      return
    }
    if (nextLen >= prevLen) {
      const appended = nextDisplayValue[nextDisplayValue.length - 1] ?? ''
      const next = password.slice(0, nextLen - 1) + appended
      setPassword(next)
      setRevealedPasswordIndex(next.length - 1)
      scheduleMaskPassword()
      return
    }
    setPassword(password.slice(0, nextLen))
    setRevealedPasswordIndex(null)
    clearRevealTimeout()
  }

  const handleLoginSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    try {
      setIsSubmitting(true)
      setError('')
      await onSubmit({ username: username.trim(), password: password.trim() })
    } catch (error) {
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCheckIn = async () => {
  if (!nameQuery.trim()) return
  setCheckingIn(true)
  setSearchError('')

  try {
    await attendanceApi.addManually(nameQuery.trim())
    setCheckedIn(true)
    setNameQuery('')
  } catch (error) {
    setSearchError(error?.response?.data?.error)
  } finally {
    setCheckingIn(false)
  }
}

  const resetAttendance = () => {
  setCheckedIn(false)
  setNameQuery('')
  setSearchError('')
}

  return (
    <div className={cn('w-full max-w-sm px-4', className)} {...props}>
      {/* Logo */}
      <div className="mb-6 flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center">
          <img src={arsenalsLogo} alt="Arsenals logo" className="h-full w-full object-contain" />
        </div>
        <div className="text-center">
          <h1 className="text-[18px] font-semibold tracking-tight text-foreground">
            Arsenal Tchoukball Club
          </h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {tab === 'login' ? 'Sign in to your account' : 'Check yourself in for today\'s session'}
          </p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="mb-5 flex rounded-lg border border-border bg-muted/40 p-0.5">
        {(['login', 'attendance'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(''); setSearchError(''); setCheckedIn(false) }}
            className={`flex-1 rounded-md py-2 text-[13px] font-medium transition-all capitalize ${
              tab === t
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'login' ? 'Admin Login' : 'Attendance'}
          </button>
        ))}
      </div>

      {/* ── Login tab ──────────────────────────────────────────────── */}
      {tab === 'login' && (
        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-xs font-medium text-muted-foreground">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
              autoFocus
              disabled={isSubmitting}
              placeholder="Enter your username"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-emerald-500/70 focus:ring-0"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-medium text-muted-foreground">Password</label>
            <input
              id="password"
              name="password"
              type="text"
              inputMode="text"
              spellCheck={false}
              value={displayPassword}
              onChange={handlePasswordChange}
              onBlur={() => { setRevealedPasswordIndex(null); clearRevealTimeout() }}
              required
              autoComplete="current-password"
              disabled={isSubmitting}
              placeholder="Enter your password"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-emerald-500/70 focus:ring-0"
            />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 w-full bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700"
          >
            {isSubmitting && <Loader2 size={16} className="mr-2 animate-spin" />}
            Sign in
          </Button>
          {error && <p className="text-center text-[12px] text-destructive">{error}</p>}
        </form>
      )}

      {/* ── Attendance tab ─────────────────────────────────────────── */}
      {tab === 'attendance' && (
  <div className="flex flex-col gap-3">
    {checkedIn ? (
      <div className="flex flex-col items-center gap-4 ...">
        <CheckCircle2 size={36} className="text-emerald-400" />
        <div>
          <p className="text-[16px] font-semibold">You're checked in!</p>
          <p className="mt-1 text-[13px] text-muted-foreground">See you on the court.</p>
        </div>
        <Button size="sm" variant="outline" onClick={resetAttendance}>
          Done
        </Button>
      </div>
    ) : (
      <>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Your name</label>
          <input
            type="text"
            value={nameQuery}
            onChange={e => { setNameQuery(e.target.value); setSearchError('') }}
            onKeyDown={e => e.key === 'Enter' && handleCheckIn()}
            placeholder="e.g. Juan Dela Cruz"
            autoFocus
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm ..."
          />
        </div>
        <Button
          onClick={handleCheckIn}
          disabled={!nameQuery.trim() || checkingIn}
          className="w-full bg-emerald-600 text-white hover:bg-emerald-500"
        >
          {checkingIn ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
          Check in
        </Button>
        {searchError && (
          <p className="text-center text-[12px] text-destructive">{searchError}</p>
        )}
      </>
    )}
  </div>
)}
    </div>
  )
}