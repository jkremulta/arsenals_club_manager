import { useState, useEffect } from 'react'
import trainingApi from './services/training'
import attendanceApi from './services/attendance'
import playersApi from './services/players'
import HamburgerDrawer from './components/HamburgerDrawer'
import StatCard from './components/StatCard'

import Header from './components/Header'
import AttendancePanel from './components/AttendancePanel'
import GamePanel from './components/GamePanel'
import BottomNav from './components/BottomNav'
import ControlsPanel from './components/ControlsPanel'

import helper from './utils/helper'

import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

import {
  AlertCircle,
  Loader2,
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
  const [initializedSkillGroup, setInitializedSkillGroup] = useState('')
  const [currentGameSkillGroup, setCurrentGameSkillGroup] = useState('')

  const [nextGamePlayers, setNextGamePlayers] = useState([])
  const [initLoading, setInitLoading]       = useState(false)
  const [startLoading, setStartLoading]     = useState(false)
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('attendance')
  const [startTime, setStartTime] = useState(() => {
    const now = new Date()
    now.setSeconds(0, 0)
    return now.toTimeString().slice(0, 5)
  })
  
  const fetchAll = async ({ showLoader = true } = {}) => {
    if (showLoader) {
      setDashboardLoading(true)
    }

    try {
      const token = user.token
      const [trainingRes, attendanceRes, playersRes] = await Promise.all([
        trainingApi.get(token),
        attendanceApi.get(token),
        playersApi.get(token),
      ])

      setTraining(trainingRes)
      setAttendance(attendanceRes)
      setCurrentGame(trainingRes?.current_players || [])
      setNextGamePlayers(trainingRes?.initialized_players || [])
      setPaidIds(new Set(attendanceRes?.filter(p => p.paid).map(p => p.id)))
      setPlayers(playersRes)
      setInitializedSkillGroup(trainingRes?.initializedSkillGroup || '')
      setCurrentGameSkillGroup(trainingRes?.currentGameSkillGroup || '')
      console.log('training', trainingRes)

    } catch (error) {
      // 401s are handled by the axios interceptor which calls logout
    } finally {
      setDashboardLoading(false)
    }
}

  useEffect(() => {
    fetchAll()
  }, [user.token])

  const handleCreateTraining = async () => {
    const token = user.token
    const [hours = '0', minutes = '0'] = startTime.split(':')
    const startDate = new Date()
    startDate.setHours(Number(hours), Number(minutes), 0, 0)

    try {
      const response = await trainingApi.post(startDate.toISOString(), token)
      toast.success('Training session created.', {
        duration: 2000
      })

      setTraining(response)
      setCreateOpen(false)

    } catch(error) {
        toast.error(error?.response?.data?.error)

        fetchAll()
    }
  }

  const handleEndTraining = async () => {
    const token = user.token

    try {
      await trainingApi.delete(token)
      toast.success('Training ended.', {
        duration: 2000
      })

      setTraining(null)
      setAttendance([])
      setSkillGroup('')
      setCurrentGame([])
      setCurrentGameSkillGroup('')
      setPaidIds(new Set())

    } catch (error) {
        toast.error(error?.response?.data?.error)
        
        // resets ui
        setTraining(null)
        setAttendance([])
        setSkillGroup('')
        setCurrentGame([])
        setCurrentGameSkillGroup('')
        setPaidIds(new Set())
    }
}

  const handleAddPlayer = async (playerId) => {
    try {
      const response = await attendanceApi.post(playerId)
      setAttendance(response.attendance)
      setPaidIds(
      new Set(response.attendance.filter(p => p.paid).map(p => p.id))
      )

      toast.success('Player added.', {
        duration: 2000
      })

    } catch(error) {
        toast.error(error?.response?.data?.error)
    }
  }

  const handleRemovePlayer = async (id) => {
    const token = user.token
    try {
      setRemovingId(id)
      await attendanceApi.delete(id, token)
      setAttendance((prev) => prev.filter((p) => p.id !== id))
      setPaidIds((prev) => { const n = new Set(prev); n.delete(id); return n })
      setRemovingId(null)
      toast.success('Player removed.', {
        duration: 2000
      })
    } catch(error) {
      toast.error(error?.response?.data?.error)
    }
  }

  const togglePaid = async (id) => {
    const token = user.token
    try {
      const isCurrentlyPaid = paidIds.has(id)
      const updatedTraining = await attendanceApi.put(id, token, { paid: !isCurrentlyPaid })
      const newPaidIds = new Set(
        updatedTraining.attendance.filter(p => p.paid).map(p => p.id)
      )
    setPaidIds(newPaidIds)
    } catch(error) {
      toast.error(error?.response?.data?.error)
    }
    
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

    if (!skillGroup) {
      return toast.warning('Select a skill group first.')
    }

    setInitLoading(true)

    try {
      const response = await trainingApi.initializeGame(skillGroup, token)

      setNextGamePlayers(response)
      setInitializedSkillGroup(skillGroup)
      toast.success(`Game initialized — ${response.length} players queued.`)

    } catch (error) {
        toast.error(error?.response?.data?.error, {
          duration: 2000
        })
    } finally {
      setInitLoading(false)
    }
}
 
  const handleStartGame = async () => {
    const token = user.token

    setStartLoading(true)

    try {
      console.log(currentGameSkillGroup)
      await trainingApi.startGame(initializedSkillGroup, token)

      setCurrentGame(nextGamePlayers)
      setNextGamePlayers([])
      setCurrentGameSkillGroup(initializedSkillGroup)

      toast.success('Game started!')
      fetchAll({ showLoader: false })
  
    } catch (error) {
      toast.error(error?.response?.data?.error)
    } 
    
    finally {
      setStartLoading(false)
    }
  }

  const sharedControlsProps = {
  skillGroup, setSkillGroup, initializedSkillGroup,
  nextGamePlayers, initLoading, startLoading,
  onInitialize: handleInitializeGame,
  onStartGame: handleStartGame,
  gamesBySkill: training?.games_by_skill,
}

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0a0a0a] font-sans text-white">
      <Toaster theme="dark" position="top-right" richColors />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <Header
        user={user}
        training={training}
        onLogout={onLogout}
        onCreateTraining={handleCreateTraining}
        onEndTraining={handleEndTraining}
        createOpen={createOpen}
        setCreateOpen={setCreateOpen}
        startTime={startTime}
        setStartTime={setStartTime}
        onHamburgerClick={() => setDrawerOpen(true)}
      />

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
        {dashboardLoading ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="flex w-full max-w-sm flex-col items-center rounded-xl border border-white/10 bg-white/[0.02] py-16 text-center">
              <Loader2 size={30} className="mb-3 animate-spin text-white/25" />
              <p className="text-sm font-medium text-white/45">Loading dashboard</p>
              <p className="mt-1 text-xs text-white/20">Checking training session state...</p>
            </div>
          </div>
        ) : !training ? (
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
              <GamePanel currentGame={currentGame} currentGameSkillGroup={currentGameSkillGroup} />
              <ControlsPanel {...sharedControlsProps} />
            </div>

            {/* ── Mobile: tab content ──────────────────────────────────── */}
            <div className="flex flex-1 flex-col overflow-hidden px-4 py-3 md:hidden">
              {activeTab === 'attendance' && (
                <AttendancePanel {...sharedAttendanceProps} />
              )}
              {activeTab === 'game' && <GamePanel currentGame={currentGame} currentGameSkillGroup={currentGameSkillGroup} />}
              {activeTab === 'controls' && <ControlsPanel {...sharedControlsProps} />}
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
