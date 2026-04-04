import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Users } from 'lucide-react'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Activity, Play, Trash2 } from 'lucide-react'
import helper from '../utils/helper'

function Header({ user, training, onLogout, onCreateTraining, onEndTraining,
  createOpen, setCreateOpen, startTime, setStartTime, onHamburgerClick }) {

  const [sessionLoading, setSessionLoading] = useState(false)
  const navigate = useNavigate()

  const handleCreate = async () => {
    setSessionLoading(true)
    try {
      await onCreateTraining()
    } finally {
      setSessionLoading(false)
    }
  }

  const handleEnd = async () => {
    setSessionLoading(true)
    try {
      await onEndTraining()
    } finally {
      setSessionLoading(false)
    }
  }

  return (
    <header className="flex-shrink-0 border-b border-white/[0.06] px-4 py-3 md:px-8 md:py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
            <Activity size={15} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-[14px] font-semibold tracking-tight md:text-[15px]">Arsenal Training</h1>
            {training?.startTime && (
              <p className="text-[10px] text-white/40 md:text-[11px]">Session · {helper.formatTime(training.startTime)}</p>
            )}
          </div>
        </div>

        {/* Desktop controls */}
        <div className="hidden items-center gap-3 md:flex">
          <span className="text-xs text-white/30">{user?.username}</span>
          <Separator orientation="vertical" className="bg-white/10" />
          {!training ? (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-500">
                  <Play size={13} className="mr-1.5" />
                  Start Session
                </Button>
              </DialogTrigger>
              <DialogContent className="border-white/10 bg-[#111] text-white">
                <DialogHeader>
                  <DialogTitle>Create Training Session</DialogTitle>
                  <DialogDescription className="text-white/50">Set the official start time for this session.</DialogDescription>
                </DialogHeader>
                <div className="py-2">
                  <label className="mb-1.5 block text-xs text-white/50">Start Time</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/50"
                  />
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreate}  // ← was onCreateTraining
                    disabled={sessionLoading}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {sessionLoading
                      ? <Loader2 size={14} className="mr-2 animate-spin" />
                      : null}
                    Create Session
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                  <Trash2 size={13} className="mr-1.5" />
                  End Session
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-white/10 bg-[#111] text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>End this training session?</AlertDialogTitle>
                  <AlertDialogDescription className="text-white/50">
                    This will reset all game counts and delete the active session. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-white/10 bg-transparent text-white/60 hover:bg-white/5">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleEnd}  // ← was onEndTraining
                    disabled={sessionLoading}
                    className="bg-red-600 hover:bg-red-500 disabled:opacity-50"
                  >
                    {sessionLoading
                      ? <Loader2 size={14} className="mr-2 animate-spin" />
                      : null}
                    End Session
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/players')}
            className="text-xs text-white/40 hover:bg-white/5 hover:text-white/70"
          >
            <Users size={13} className="mr-1.5" />
            Players
          </Button>
          <Button size="sm" variant="ghost" onClick={onLogout} className="text-xs text-white/40 hover:bg-white/5 hover:text-white/70">
            Logout
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex flex-col gap-1 rounded p-2 hover:bg-white/[0.06] md:hidden"
          onClick={onHamburgerClick}
        >
          <span className="block h-[1.5px] w-[18px] rounded bg-white/60" />
          <span className="block h-[1.5px] w-[18px] rounded bg-white/60" />
          <span className="block h-[1.5px] w-[18px] rounded bg-white/60" />
        </button>
      </div>
    </header>
  )
}

export default Header
