import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import helper from '../utils/helper'
import { Loader2, Play, Trash2, LogOut, Users } from 'lucide-react'

function HamburgerDrawer({ open, onClose, user, training, onLogout, onCreateTraining,
  onEndTraining, createOpen, setCreateOpen, startTime, setStartTime,
  dashboardLoading = false }) {

  const [sessionLoading, setSessionLoading] = useState(false)
  const navigate = useNavigate()

  const handleCreate = async () => {
    setSessionLoading(true)
    try { await onCreateTraining(); onClose(false) }
    finally { setSessionLoading(false) }
  }

  const handleEnd = async () => {
    setSessionLoading(true)
    try { await onEndTraining(); onClose(false) }
    finally { setSessionLoading(false) }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="flex w-56 flex-col p-0 bg-background">
        <SheetHeader className="border-b border-border px-4 py-4">
          <SheetTitle className="text-left text-[13px] font-semibold">
            {helper.capitalize(user?.username)}
          </SheetTitle>
          <p className="text-left text-[11px] text-muted-foreground">Admin</p>
        </SheetHeader>

        <div className="flex flex-col py-2">
          <button
            onClick={() => { navigate('/members'); onClose() }}
            className="flex items-center gap-3 px-4 py-3 text-[13px] text-muted-foreground hover:bg-card"
          >
            <Users size={15} />
            Members
          </button>
        </div>

        <Separator />

        {/* Session control */}
        <div className="px-4 py-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Session</p>
          {dashboardLoading ? (
            <Button
              size="sm"
              variant="secondary"
              disabled
              className="pointer-events-none w-full border-border bg-card text-muted-foreground shadow-none disabled:opacity-100"
            >
              <Loader2 size={12} className="mr-1.5 animate-spin" />
              Checking session…
            </Button>
          ) : !training ? (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full bg-emerald-600 text-white hover:bg-emerald-500">
                  <Play size={12} className="mr-1.5" />
                  Start Session
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Training Session</DialogTitle>
                  <DialogDescription>Set the official start time for this session.</DialogDescription>
                </DialogHeader>
                <div className="py-2">
                  <label className="mb-1.5 block text-xs text-muted-foreground">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-emerald-500/50"
                  />
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreate}
                    disabled={sessionLoading}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {sessionLoading && <Loader2 size={14} className="mr-2 animate-spin" />}
                    Create Session
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" className="border border-border bg-card w-full text-red-400 hover:bg-red-500/10 hover:text-red-300">
                  <Trash2 size={12} className="mr-1.5" />
                  End Session
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>End this training session?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reset all game counts and delete the active session. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleEnd}
                    disabled={sessionLoading}
                    className="bg-red-600 hover:bg-red-500 disabled:opacity-50"
                  >
                    {sessionLoading && <Loader2 size={14} className="mr-2 animate-spin" />}
                    End Session
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <div className="mt-auto border-t border-border">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 px-4 py-4 text-[13px] text-red-400 hover:bg-red-500/[0.06]"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default HamburgerDrawer