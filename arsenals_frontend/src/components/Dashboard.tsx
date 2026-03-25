import { useState, useEffect, useCallback } from 'react'
import trainingServices from '../services/training'
// import { trainingApi, attendanceApi, playersApi } from '@/services/api'
 
import { Button } from '@/components/ui/button'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
 
import {
  Users,
  Play,
  Zap,
  Trash2,
  UserPlus,
  ChevronDown,
  Trophy,
  Clock,
  Activity,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react'

const Dashboard = ({ onLogout, user }) => {
  const [training, setTraining] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [startTime, setStartTime] = useState(() => {
    const now = new Date()
    now.setSeconds(0, 0)
    return now.toISOString().slice(0, 16)
  })

  useEffect(() => {
    const fetchTraining = async () => {
      const token = user.token
      const response = await trainingServices.getTraining(token)

      if (response?.error) return toast.error(response.error)

      setTraining(response)
    }
    
    fetchTraining()
  }, [user.token])

  const handleCreateTraining = async () => {
    const token = user.token
    const response = await trainingServices.createTraining(new Date(startTime).toISOString(), token)

    if (response?.error) return toast.error(response.error)

    toast.success('Training session created.')
    setTraining(response)
    setCreateOpen(false)
  }
 
  const handleEndTraining = async () => {
    const token = user.token
    const res = await trainingServices.deleteTraining(token)

    if (res?.error) return toast.error(res.error)

    toast.success('Training ended. Game counts reset.')
    setTraining(null)
  }
 
  const formattedStart = training?.startTime
    ? new Date(training.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null
 
  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-white">
      <Toaster theme="dark" position="top-right" />
 
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="border-b border-white/[0.06] px-8 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
              <Activity size={15} className="text-emerald-400" />
            </div>
            <div>
              <h1 className="text-[15px] font-semibold tracking-tight">Arsenal Training</h1>
              {formattedStart && (
                <p className="text-[11px] text-white/40">Session started at {formattedStart}</p>
              )}
            </div>
          </div>
 
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/30">{user.username}</span>
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
                    <DialogDescription className="text-white/50">
                      Set the official start time for this session.
                    </DialogDescription>
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
                    <Button onClick={handleCreateTraining} className="bg-emerald-600 hover:bg-emerald-500">
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
                    <AlertDialogAction onClick={handleEndTraining} className="bg-red-600 hover:bg-red-500">End Session</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button size="sm" variant="ghost" onClick={onLogout} className="text-xs text-white/40 hover:bg-white/5 hover:text-white/70">
              Logout
            </Button>
          </div>
        </div>
      </header>

    </div>
  )

}

export default Dashboard