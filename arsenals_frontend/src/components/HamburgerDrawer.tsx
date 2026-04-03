import { useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

import {
  Play,
  Trash2,
  LogOut,
  Settings,
  User,
} from 'lucide-react'


function HamburgerDrawer({ open, onClose, user, training, onLogout, onCreateTraining, onEndTraining, createOpen, setCreateOpen, startTime, setStartTime }) {
  const [sessionLoading, setSessionLoading] = useState(false)
  
  const handleCreate = async () => {
    setSessionLoading(true)
    try {
      await onCreateTraining()
      onClose(false)
    } finally {
      setSessionLoading(false)
    }
  }
  
  const handleEnd = async () => {
    setSessionLoading(true)
    try {
      await onEndTraining()
      onClose(false)
    } finally {
      setSessionLoading(false)
    }
  }
  
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="flex w-56 flex-col border-white/[0.08] bg-[#141414] p-0 text-white"
      >
        <SheetHeader className="border-b border-white/[0.07] px-4 py-4">
          <SheetTitle className="text-left text-[13px] font-semibold text-white">
            {user?.username}
          </SheetTitle>
          <p className="text-left text-[11px] text-white/35">Admin</p>
        </SheetHeader>
 
        <div className="flex flex-col py-2">
          <button className="flex items-center gap-3 px-4 py-3 text-[13px] text-white/60 hover:bg-white/[0.04]">
            <User size={15} />
            Profile
          </button>
          <button className="flex items-center gap-3 px-4 py-3 text-[13px] text-white/60 hover:bg-white/[0.04]">
            <Settings size={15} />
            Settings
          </button>
        </div>
 
        <Separator className="bg-white/[0.07]" />
 
        {/* Session control */}
        <div className="px-4 py-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/35">Session</p>
          {!training ? (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full bg-emerald-600 text-white hover:bg-emerald-500">
                  <Play size={12} className="mr-1.5" />
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
                <Button size="sm" variant="outline" className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                  <Trash2 size={12} className="mr-1.5" />
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
        </div>
 
        <div className="mt-auto border-t border-white/[0.07]">
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