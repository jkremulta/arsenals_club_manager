import { useState, useEffect } from 'react'
import trainingApi from '../services/training'
import attendanceApi from '../services/attendance'
import playersApi from '../services/players'
import HamburgerDrawer from './HamburgerDrawer'
import StatCard from './StatCard'

import AttendancePanel from './AttendancePanel'
import GamePanel from './GamePanel'
import BottomNav from './BottomNav'
import ControlsPanel from './ControlsPanel'

import helper from '../utils/helper'

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
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

import {
  Play,
  Trash2,
  Activity,
  AlertCircle,
  Users,
  ShieldCheck,
  Trophy,
  Clock,
} from 'lucide-react'

const Dashboard = ({ onLogout, user }) => {
  const [training, setTraining] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [players, setPlayers] = useState([])
  const [createOpen, setCreateOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [paidIds, setPaidIds] = useState(new Set())
  const [currentGame, setCurrentGame] = useState([])
  const [removingId, setRemovingId] = useState(null)

  const [skillGroup, setSkillGroup]         = useState('')
  const [lastSkillGroup, setLastSkillGroup] = useState('')

  const [nextGamePlayers, setNextGamePlayers] = useState([])
  const [initLoading, setInitLoading]       = useState(false)
  const [startLoading, setStartLoading]     = useState(false)
  const [availablePlayers, setAvailablePlayers] = useState([])
  const [activeTab, setActiveTab] = useState('attendance')
  const [startTime, setStartTime] = useState(() => {
    const now = new Date()
    now.setSeconds(0, 0)
    return now.toISOString().slice(0, 16)
  })
  

  const fetchAll = async () => {
    const token = user.token
    const [trainingRes, attendanceRes, playersRes] = await Promise.all([
      trainingApi.get(token),
      attendanceApi.get(token),
      playersApi.get(token),
    ])

    if (trainingRes?.error) return toast.error(trainingRes.error)
    if (attendanceRes?.error) return toast.error(attendanceRes.error)
    if (playersRes?.error) return toast.error(playersRes.error)

    setTraining(trainingRes)
    setAttendance(attendanceRes)
    setCurrentGame(trainingRes.current_players || [])
    setNextGamePlayers(trainingRes.initialized_players)
    setPaidIds(new Set(attendanceRes.filter(p => p.paid).map(p => p.id)))
    setPlayers(playersRes)
    
    console.log(trainingRes)
}

  useEffect(() => {
    fetchAll()
  }, [user.token])



  const handleCreateTraining = async () => {
    const token = user.token
    const response = await trainingApi.post(new Date(startTime).toISOString(), token)

    if (response?.error) return toast.error(response.error)

    toast.success('Training session created.', {
      duration: 2000
    })

    setTraining(response)
    setCreateOpen(false)
  }

  const handleEndTraining = async () => {
    const token = user.token
    const response = await trainingApi.delete(token)

    if (response?.error) return toast.error(response.error)

    toast.success('Training ended. Game counts reset.', {
      duration: 2000
    })

    setTraining(null)
    setAttendance([])
    setPaidIds(new Set())
  }

  const handleAddPlayer = async (playerId) => {
    const token = user.token
    const response = await attendanceApi.post(playerId, token)
    if (response?.error) return toast.error(response.error)
    toast.success('Player added.', {
      duration: 2000
    })

    setAttendance(response.attendance)
    setPaidIds(prev => new Set(prev))
  }

  const handleRemovePlayer = async (id) => {
    const token = user.token
    setRemovingId(id)
    await attendanceApi.delete(id, token)
    setAttendance((prev) => prev.filter((p) => p.id !== id))
    setPaidIds((prev) => { const n = new Set(prev); n.delete(id); return n })
    setRemovingId(null)
    toast.success('Player removed.', {
      duration: 2000
    })
  }

  const togglePaid = async (id) => {
    const token = user.token
    const isCurrentlyPaid = paidIds.has(id)
    const updatedTraining = await attendanceApi.put(id, token, { paid: !isCurrentlyPaid })
    const newPaidIds = new Set(
      updatedTraining.attendance.filter(p => p.paid).map(p => p.id)
    )
    setPaidIds(newPaidIds)
  }

  

  const attendanceIds = new Set(attendance.map(p => p.id))
  const sharedAttendanceProps = {
    attendance,
    availablePlayers: players.filter(p => !attendanceIds.has(p.id)),
    paidIds,
    currentGame,
    removingId,
    onAdd: handleAddPlayer,
    onRemove: handleRemovePlayer,
    onTogglePaid: togglePaid,
  }

  // ── Game ────────────────────────────────────────────────────────────────
  const handleInitializeGame = async () => {
    const token = user.token

    if (!skillGroup) return toast.warning('Select a skill group first.')
    setInitLoading(true)
    try {
      const res = await trainingApi.initializeGame(skillGroup, token)
      if (res?.error) return toast.error(res.error)
      setNextGamePlayers(res)
      setLastSkillGroup(skillGroup)
      toast.success(`Game initialized — ${res.length} players queued.`)
    } finally {
      setInitLoading(false)
    }
  }
 
  const handleStartGame = async () => {
    const token = user.token

    setStartLoading(true)
    try {
      const res = await trainingApi.startGame(token)
      if (res?.error) return toast.error(res.error)
      setCurrentGame(nextGamePlayers)
      setNextGamePlayers([])
      toast.success('Game started!')
      fetchAll()
    } finally {
      setStartLoading(false)
    }
  }

  const sharedControlsProps = {
    training, skillGroup, setSkillGroup, lastSkillGroup,
    nextGamePlayers, initLoading, startLoading,
    onInitialize: handleInitializeGame,
    onStartGame: handleStartGame,
    onCreateTraining: handleCreateTraining,
    onEndTraining: handleEndTraining,
    createOpen, setCreateOpen, startTime, setStartTime,
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0a0a0a] font-sans text-white">
      <Toaster theme="dark" position="top-right" />

      {/* ── Header ──────────────────────────────────────────────────────── */}
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

          {/* Desktop header controls */}
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
                    <Button onClick={handleCreateTraining} className="bg-emerald-600 hover:bg-emerald-500">Create Session</Button>
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

          {/* Mobile: hamburger */}
          <button
            className="flex flex-col gap-1 rounded p-2 hover:bg-white/[0.06] md:hidden"
            onClick={() => setDrawerOpen(true)}
          >
            <span className="block h-[1.5px] w-[18px] rounded bg-white/60" />
            <span className="block h-[1.5px] w-[18px] rounded bg-white/60" />
            <span className="block h-[1.5px] w-[18px] rounded bg-white/60" />
          </button>
        </div>
      </header>

      {/* ── Mobile drawer ───────────────────────────────────────────────── */}
      <HamburgerDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={user}
        training={training}
        onLogout={onLogout}
        onCreateTraining={handleCreateTraining}
        onEndTraining={handleEndTraining}
        createOpen={createOpen}
        setCreateOpen={setCreateOpen}
        startTime={startTime}
        setStartTime={setStartTime}
      />

      {/* ── Middle: flex-1 so it fills space between header and bottom nav ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {!training ? (
          /* No session state */
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="flex w-full max-w-sm flex-col items-center rounded-xl border border-dashed border-white/10 py-16 text-center">
              <AlertCircle size={30} className="mb-3 text-white/20" />
              <p className="text-sm font-medium text-white/40">No active training session</p>
              <p className="mt-1 text-xs text-white/20">Open the menu to start a session</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Stats */}
            <div className="flex-shrink-0 px-4 pt-4 md:px-8 md:pt-5">
              <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
                <StatCard icon={Users}       label="Attendance"    value={attendance.length}                          accent="#34d399" />
                <StatCard icon={ShieldCheck} label="Paid"          value={`${paidIds.size} / ${attendance.length}`}   accent="#34d399" valueStyle={{ color: '#34d399' }} />
                <StatCard icon={Trophy}      label="Games Today"   value={training.games_today || '—'}                accent="#a78bfa" />
                <StatCard icon={Clock}       label="Session Start" value={helper.formatTime(training.startTime) ?? '—'} accent="#60a5fa" />
              </div>
            </div>

            {/* ── Desktop: 3-col layout ────────────────────────────────── */}
            <div className="mx-auto hidden w-full max-w-7xl flex-1 gap-4 overflow-hidden px-8 py-4 md:grid md:grid-cols-3">
              <AttendancePanel {...sharedAttendanceProps} />
              <GamePanel currentGame={currentGame} lastSkillGroup={lastSkillGroup} />
              <ControlsPanel {...sharedControlsProps} />
            </div>

            {/* ── Mobile: tab content ──────────────────────────────────── */}
            <div className="flex flex-1 flex-col overflow-hidden px-4 py-3 md:hidden">
              {activeTab === 'attendance' && (
                <AttendancePanel {...sharedAttendanceProps} />
              )}
              {activeTab === 'game' && <GamePanel currentGame={currentGame} lastSkillGroup={lastSkillGroup} />}
              {activeTab === 'controls' && <div className="overflow-y-auto"><ControlsPanel {...sharedControlsProps} /></div>}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom nav — always pinned, mobile only ──────────────────────── */}
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  )
}

export default Dashboard