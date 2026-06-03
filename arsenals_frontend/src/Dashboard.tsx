import HamburgerDrawer from './components/HamburgerDrawer'
import StatCard from './components/dashboard/StatCard'
import Header from './components/Header'
import AttendancePanel from './components/dashboard/AttendancePanel'
import GamePanel from './components/dashboard/GamePanel'
import BottomNav from './components/dashboard/BottomNav'
import ControlsPanel from './components/dashboard/ControlsPanel'
import helper from './utils/helper'
import { useDashboard } from './hooks/useDashboard'
import { useUIStore } from './stores/useUIStore'

import { AlertCircle, Users, ShieldCheck, Trophy, Clock } from 'lucide-react'
import DashboardLoading from './components/dashboard/DashboardLoading'
import DashboardEmpty from './components/dashboard/DashboardEmpty'
import StatBar from './components/dashboard/StatBar'

const Dashboard = ({ onLogout, user }) => {

  const { 
    skillGroup, setSkillGroup, 
    createOpen, setCreateOpen, 
    drawerOpen, setDrawerOpen,
    activeTab, setActiveTab,
    startTime, setStartTime
  } = useUIStore()
  const {
    dashboardQuery, training, attendance, players, teams, paidIds,
    handleCreateTraining, handleInitializeGame, togglePaid,
    endTrainingMutation,
    addPlayerMutation, removePlayerMutation, togglePaidMutation,
    initializeGameMutation, startGameMutation, replacePlayerMutation,
  } = useDashboard(user.token)

  const currentGame = training?.current_players || []
  const nextGamePlayers = training?.initialized_players || []
  const initializedSkillGroup = training?.initializedSkillGroup || ''
  const currentGameSkillGroup = training?.currentGameSkillGroup || ''

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
      <Header user={user} onLogout={onLogout}/>

      {/* ── Mobile drawer ───────────────────────────────────────────────── */}
      <HamburgerDrawer user={user} onLogout={onLogout}/>

      {/* ── Middle: flex-1 so it fills space between header and bottom nav ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {dashboardQuery.isLoading ? (
          <DashboardLoading />
        ) : !training ? (
          /* No session state */
          <DashboardEmpty />
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Stats */}
            <StatBar attendance={attendance} paidIds={paidIds} training={training} />

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
