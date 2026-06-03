import { useUIStore } from '@/stores/useUIStore'
import { useDashboard } from '@/hooks/useDashboard'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useNavigate } from 'react-router-dom'
import { Loader2, Users, Play, Trash2 } from 'lucide-react'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import helper from '../utils/helper'
import arsenalsLogo from './icons/arsenals logo transparent.png'

function Header({ dashboardQuery, training, createTrainingMutation, endTrainingMutation, handleCreateTraining, user, onLogout }) {

  const { createOpen, setCreateOpen, startTime, setStartTime, setDrawerOpen } = useUIStore()

  const navigate = useNavigate()

  const dashboardLoading = dashboardQuery.isLoading
  const sessionLoading = createTrainingMutation.isPending || endTrainingMutation.isPending

  return (
    <header className="flex-shrink-0 border-b border-border px-4 py-3 md:px-8 md:py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center">
            <img src={arsenalsLogo} alt="Arsenals logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <h1 className="text-[14px] font-semibold tracking-tight text-foreground md:text-[15px]">
              Arsenal Tchoukball Club
            </h1>
            <p className="text-[10px] text-muted-foreground/60 md:text-[11px]">
              Session ·{' '}
              {dashboardLoading ? (
                <span className="inline-flex items-center gap-1">
                  <Loader2 size={10} className="animate-spin text-muted-foreground/50" />
                  Checking…
                </span>
              ) : training?.startTime ? (
                helper.formatTime(training.startTime)
              ) : (
                'N/A'
              )}
            </p>
          </div>
        </div>

        {/* Desktop controls */}
        <div className="hidden items-center gap-3 md:flex">
          <span className="text-xs text-muted-foreground">{helper.capitalize(user?.username)}</span>
          <Separator orientation="vertical" className="bg-border" />
          {dashboardLoading ? (
            <Button
              size="sm"
              variant="secondary"
              disabled
              className="pointer-events-none border-border bg-card text-muted-foreground shadow-none disabled:opacity-100"
            >
              <Loader2 size={13} className="mr-1.5 animate-spin" />
              Checking session…
            </Button>
          ) : !training ? (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-500">
                  <Play size={13} className="mr-1.5" />
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
                    onClick={handleCreateTraining}
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
                <Button size="sm" className="border border-border bg-card text-red-400 hover:bg-red-500/10 hover:text-red-300">
                  <Trash2 size={13} className="mr-1.5" />
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
                    onClick={() => endTrainingMutation.mutate()}
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
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/members')}
            className="text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Users size={13} className="mr-1.5" />
            Members
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onLogout}
            className="text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            Logout
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex flex-col gap-1 rounded p-2 hover:bg-card md:hidden"
          onClick={() => setDrawerOpen(true)}
        >
          <span className="block h-[1.5px] w-[18px] rounded bg-foreground/60" />
          <span className="block h-[1.5px] w-[18px] rounded bg-foreground/60" />
          <span className="block h-[1.5px] w-[18px] rounded bg-foreground/60" />
        </button>
      </div>
    </header>
  )
}

export default Header