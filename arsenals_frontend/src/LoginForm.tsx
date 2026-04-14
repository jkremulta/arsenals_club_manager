import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import arsenalsLogo from './components/icons/arsenals logo transparent.png'

export function LoginForm({
  className,
  onSubmit,
  ...props
}: Omit<React.ComponentProps<'div'>, 'onSubmit'> & {
  onSubmit: (data: { username: string; password: string }) => void | Promise<void>
}) {
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    const form = e.currentTarget
    const username = (form.elements.namedItem('username') as HTMLInputElement).value.trim()
    const password = (form.elements.namedItem('password') as HTMLInputElement).value.trim()

    try {
      setIsSubmitting(true)
      setError('')
      await onSubmit({ username, password })
    } catch (error) {
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn('w-full max-w-sm px-4', className)} {...props}>
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center">
          <img src={arsenalsLogo} alt="Arsenals logo" className="h-full w-full object-contain" />
        </div>
        <div className="text-center">
          <h1 className="text-[18px] font-semibold tracking-tight text-foreground">
            Arsenal Tchoukball Club
          </h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Sign in to your account
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="username" className="text-xs font-medium text-muted-foreground">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            autoComplete="username"
            autoFocus
            disabled={isSubmitting}
            placeholder="Enter your username"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-emerald-500/70 focus:ring-0"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
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
        {error && (
          <p className="text-center text-[12px] text-destructive">{error}</p>
        )}
      </form>
    </div>
  )
}