import HamburgerDrawer from './components/HamburgerDrawer'
import Header from './components/Header'
import BottomNav from './components/dashboard/BottomNav'
import { useDashboard } from './hooks/useDashboard'

import DashboardLoading from './components/dashboard/DashboardLoading'
import DashboardEmpty from './components/dashboard/DashboardEmpty'
import StatBar from './components/dashboard/StatBar'
import DashboardLayout from './components/dashboard/DashboardLayout'

const Dashboard = ({ onLogout, user }) => {
  const {
    dashboardQuery, training, attendance, players, teams, paidIds,
    handleCreateTraining, handleInitializeGame, togglePaid,
    endTrainingMutation,
    createTrainingMutation,
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
    initializedSkillGroup,
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background font-sans text-foreground">
      <Header 
        dashboardQuery={dashboardQuery} 
        training={training} 
        createTrainingMutation={createTrainingMutation}
        endTrainingMutation={endTrainingMutation}
        handleCreateTraining={handleCreateTraining}
        user={user}
        onLogout={onLogout}/>

      <HamburgerDrawer
        dashboardQuery={dashboardQuery}
        handleCreateTraining={handleCreateTraining}
        createTrainingMutation={createTrainingMutation}
        endTrainingMutation={endTrainingMutation}
        training={training}
        user={user}
        onLogout={onLogout}/>

      <div className="flex flex-1 flex-col overflow-hidden">
        {dashboardQuery.isLoading ? (
          <DashboardLoading />
        ) : !training ? (
          <DashboardEmpty />
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            <StatBar attendance={attendance} paidIds={paidIds} training={training} />
            <DashboardLayout
              sharedAttendanceProps={sharedAttendanceProps}
              sharedControlsProps={sharedControlsProps}
              currentGame={currentGame}
              currentGameSkillGroup={currentGameSkillGroup}
              training={training}
            />
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

export default Dashboard
