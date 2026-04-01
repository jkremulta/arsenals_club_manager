import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Activity } from 'lucide-react'

export function LoginForm({
  className,
  onSubmit,
  ...props
}: Omit<React.ComponentProps<'div'>, 'onSubmit'> & {
  onSubmit: (data: { username: string; password: string }) => void
}) {
  const handleSubmit = (e: React.BaseSyntheticEvent) => {
    e.preventDefault()
    const form = e.currentTarget
    const username = (form.elements.namedItem('username') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value
    onSubmit({ username, password })
  }

  return (
    <div
      className={cn('w-full max-w-sm px-4', className)}
      {...props}
    >
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
          <Activity size={18} className="text-emerald-400" />
        </div>
        <div className="text-center">
          <h1 className="text-[18px] font-semibold tracking-tight text-white">
            Arsenal Training
          </h1>
          <p className="mt-0.5 text-[13px] text-white/40">
            Sign in to your account
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="username"
            className="text-xs font-medium text-white/50"
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            autoComplete="username"
            autoFocus
            placeholder="Enter your username"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition-colors focus:border-emerald-500/50 focus:bg-white/[0.07]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-xs font-medium text-white/50"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Enter your password"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition-colors focus:border-emerald-500/50 focus:bg-white/[0.07]"
          />
        </div>

        <Button
          type="submit"
          className="mt-1 w-full bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700"
        >
          Sign in
        </Button>
      </form>
    </div>
  )
}