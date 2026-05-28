import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import trainingApi from './services/training'
import attendanceApi from './services/attendance'
import playersApi from './services/players'
import teamsApi from './services/team'
import HamburgerDrawer from './components/HamburgerDrawer'
import StatCard from './components/dashboard/StatCard'

import Header from './components/Header'
import AttendancePanel from './components/dashboard/AttendancePanel'
import GamePanel from './components/dashboard/GamePanel'
import BottomNav from './components/dashboard/BottomNav'
import ControlsPanel from './components/dashboard/ControlsPanel'

import helper from './utils/helper'

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
  
  const queryClient = useQueryClient()
  const token = user.token

  // dashboard query using tanstack
  const dashboardQuery = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const [trainingRes, attendanceRes, playersRes, teamsRes] = await Promise.all([
        trainingApi.get(token),
        attendanceApi.get(token),
        playersApi.get(token),
        teamsApi.get(token)
      ])

      return {
        training: trainingRes,
        attendance: attendanceRes,
        players: playersRes,
        teams: teamsRes,
      }
    }
  })

  const training = dashboardQuery.data?.training
  const attendance = dashboardQuery.data?.attendance || []
  const players = dashboardQuery.data?.players || []
  const teams = dashboardQuery.data?.teams

  const currentGame = training?.current_players || []
  const nextGamePlayers = training?.initialized_players || []
  const initializedSkillGroup = training?.initializedSkillGroup || ''
  const currentGameSkillGroup = training?.currentGameSkillGroup || ''

  const paidIds = new Set(attendance
    .filter(p => p.paid)
    .map(p => p.id)
  )

  const [skillGroup, setSkillGroup] = useState('')

  const [activeTab, setActiveTab] = useState('attendance')
  const [createOpen, setCreateOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const [startTime, setStartTime] = useState(() => {
    const now = new Date()
    now.setSeconds(0, 0)
    return now.toTimeString().slice(0, 5)
  })

  // create training using tanstack
  const createTrainingMutation = useMutation({
    mutationFn: (startDateIso) => 
      trainingApi.post(startDateIso, token),

    onSuccess: () => {
      toast.success('Training session created.', {
        duration: 2000
      })

      setCreateOpen(false)

      queryClient.invalidateQueries({
        queryKey: ['dashboard']
      })
    },

    onError: (error) => {
      toast.error(error?.response?.data?.error)
    }
  })

  const handleCreateTraining = async () => {
    const [hours = '0', minutes = '0'] = startTime.split(':')

    const startDate = new Date()

    startDate.setHours(Number(hours), Number(minutes), 0, 0)

    createTrainingMutation.mutate(startDate.toISOString())
  }

  const endTrainingMutation = useMutation({
    mutationFn: () => 
      trainingApi.delete(token),

    onSuccess: () => {
      toast.success('Training ended.', {
        duration: 2000
      })

      queryClient.invalidateQueries({
        queryKey: ['dashboard']
      })
    },

    onError: (error) => {
      toast.error(error?.response?.data?.error)
    }
  })


  // tanstack add player 
  const addPlayerMutation = useMutation({
    mutationFn: (playerId) =>
      attendanceApi.post(playerId, token),

    onSuccess: () => {
      toast.success('Player added.')

      queryClient.invalidateQueries({
        queryKey: ['dashboard']
      })
    },

    onError: (error) => {
      toast.error(error?.response?.data?.error)
    }
  })

  // tanstack remove player
  const removePlayerMutation = useMutation({
    mutationFn: (playerId) =>
      attendanceApi.delete(playerId, token),

    onSuccess: () => {
      toast.success('Player removed.', {
        duration: 2000
      })

      queryClient.invalidateQueries({
        queryKey: ['dashboard']
      })
    },

    onError: (error) => {
      toast.error(error?.response?.data?.error)
    }
  })

  // togglepaid mutation

  const togglePaidMutation = useMutation({
    mutationFn: ({ id, paid }) =>
      attendanceApi.put(
        id,
        token,
        { paid }
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['dashboard']
      })
    },

    onError: (error) => {
      toast.error(error?.response?.data?.error, {
        duration: 2000
      })
    }
  })

  const togglePaid = (id) => {
    const isCurrentlyPaid =
      paidIds.has(id)

    togglePaidMutation.mutate({id,paid: !isCurrentlyPaid
    })
  }

  // initialize game
 const initializeGameMutation = useMutation({
  mutationFn: (data) =>
    trainingApi.initializeGame(data, user.token),

  onSuccess: () => {
    toast.success('Game initialized.', { duration: 2000 })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  },

  onError: (error) => {
    toast.error(error?.response?.data?.error, {
      duration: 2000
    })
  }
})

const handleInitializeGame = (data) => {
  if (
    data?.teamA &&
    data?.teamB &&
    data.teamA === data.teamB
  ) {
    return toast.warning('Select two different teams.', {
      duration: 2000
    })
  }

  initializeGameMutation.mutate(data)
}

// mutate start game

const startGameMutation = useMutation({
  mutationFn: () => 
    trainingApi.startGame(token),

  onSuccess: () => {
    toast.success('Game started!', {
        duration: 2000
    })

    queryClient.invalidateQueries({
        queryKey: ['dashboard']
    })
  },

  onError: (error) => {
    toast.error(error?.response?.data?.error, {
        duration: 2000
    })
  }
  })
 

  const replacePlayerMutation = useMutation({
    mutationFn: ({ outPlayerId, inPlayerId }) => 
      trainingApi.replacePlayer(outPlayerId, inPlayerId, token),

    onSuccess: () => {
      toast.success('Player replaced.', {
        duration: 2000
      })

      queryClient.invalidateQueries({
        queryKey: ['dashboard']
     })
    },

    onError: (error) => {
      toast.error(error?.response?.data?.error, {
        duration: 2000
      })
    }
  })

  const attendanceIds = new Set(attendance.map(p => p.id))
  const sharedAttendanceProps = {
    attendance,
    availablePlayers: players.filter(p => !attendanceIds.has(p.id)),
    paidIds,
    currentGame,
    removingId: removePlayerMutation.isPending ? removePlayerMutation.variables : null,
    onAdd: addPlayerMutation.mutate,
    onRemove: removePlayerMutation.mutate,
    onTogglePaid: togglePaid,
    addLoading: addPlayerMutation.isPending,
    togglingId: togglePaidMutation.isPending ? togglePaidMutation.variables?.id : null,
  }

  const sharedControlsProps = {
    skillGroup,
    setSkillGroup,
    initializedSkillGroup,
    nextGamePlayers,
    currentGame,
    attendance,
    initLoading: initializeGameMutation.isPending,
    startLoading: startGameMutation.isPending,
    onInitialize: handleInitializeGame,
    onStartGame: startGameMutation.mutate,
    onReplace: replacePlayerMutation.mutate,
    gamesBySkill: training?.games_by_skill,
    teams,
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background font-sans text-foreground">
      <Header
        user={user}
        training={training}
        onLogout={onLogout}
        onCreateTraining={handleCreateTraining}
        onEndTraining={endTrainingMutation.mutate}
        createOpen={createOpen}
        setCreateOpen={setCreateOpen}
        startTime={startTime}
        setStartTime={setStartTime}
        onHamburgerClick={() => setDrawerOpen(true)}
        sessionLoading={createTrainingMutation.isPending || endTrainingMutation.isPending}
      />

      {/* ── Mobile drawer ───────────────────────────────────────────────── */}
      <HamburgerDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={user}
        training={training}
        onLogout={onLogout}
        onCreateTraining={handleCreateTraining}
        onEndTraining={endTrainingMutation.mutate}
        createOpen={createOpen}
        setCreateOpen={setCreateOpen}
        startTime={startTime}
        setStartTime={setStartTime}
      />

      {/* ── Middle: flex-1 so it fills space between header and bottom nav ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {dashboardQuery.isLoading ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="flex w-full max-w-sm flex-col items-center rounded-xl border border-border bg-card py-16 text-center">
              <Loader2
                size={30}
                className="mb-3 animate-spin text-muted-foreground/40"
              />
              <p className="text-sm font-medium text-muted-foreground">
                Loading dashboard
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Checking training session state...
              </p>
            </div>
          </div>
        ) : !training ? (
          /* No session state */
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="flex w-full max-w-sm flex-col items-center rounded-xl border border-dashed border-border py-16 text-center">
              <AlertCircle
                size={30}
                className="mb-3 text-muted-foreground/40"
              />
              <p className="text-sm font-medium text-muted-foreground">
                No active training session
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Open the menu to start a session
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Stats */}
            <div className="flex-shrink-0 px-4 pt-4 md:px-8 md:pt-5">
              <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
                <StatCard
                  icon={Users}
                  label="Attendance"
                  value={attendance.length}
                  accent="#34d399"
                />
                <StatCard
                  icon={ShieldCheck}
                  label="Paid"
                  value={`${paidIds.size} / ${attendance.length}`}
                  accent="#34d399"
                  valueStyle={{ color: '#34d399' }}
                />
                <StatCard
                  icon={Trophy}
                  label="Games Today"
                  value={training.games_today || '—'}
                  accent="#a78bfa"
                />
                <StatCard
                  icon={Clock}
                  label="Session Start"
                  value={helper.formatTime(training.startTime) ?? '—'}
                  accent="#60a5fa"
                />
              </div>
            </div>

            {/* ── Desktop: 3-col layout ────────────────────────────────── */}
            <div className="mx-auto hidden w-full max-w-7xl flex-1 gap-4 overflow-hidden px-8 py-4 md:grid md:grid-cols-3">
              <AttendancePanel {...sharedAttendanceProps} />

              <GamePanel
                currentGame={currentGame}
                currentGameSkillGroup={currentGameSkillGroup}
                currentGameTeam={training?.currentGameTeam}
                teamA={training?.team_a}
                teamB={training?.team_b}
              />

              <ControlsPanel {...sharedControlsProps} />
            </div>

            {/* ── Mobile: tab content ──────────────────────────────────── */}
            <div className="flex flex-1 flex-col overflow-hidden px-4 py-3 md:hidden">
              {activeTab === 'attendance' && (
                <AttendancePanel {...sharedAttendanceProps} />
              )}

              {activeTab === 'game' && (
                <GamePanel
                  currentGame={currentGame}
                  currentGameSkillGroup={currentGameSkillGroup}
                  currentGameTeam={training?.currentGameTeam}
                  teamA={training?.team_a}
                  teamB={training?.team_b}
                />
              )}

              {activeTab === 'controls' && (
                <ControlsPanel {...sharedControlsProps} />
              )}
            </div>
          </div>
        )}
      </div>

      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  )
}

export default Dashboard
