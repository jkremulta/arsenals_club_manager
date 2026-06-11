import HamburgerDrawer from './components/HamburgerDrawer'
import Header from './components/Header'
import BottomNav from './components/dashboard/BottomNav'
import { useDashboard } from './hooks/useDashboard'

import DashboardLoading from './components/dashboard/DashboardLoading'
import DashboardEmpty from './components/dashboard/DashboardEmpty'
import DashboardLayout from './components/dashboard/DashboardLayout'

const Dashboard = ({ onLogout, user }) => {
  const {
    dashboardQuery, training, attendance, players, paidIds,
    handleCreateTraining, handleInitializeGame, togglePaid,
    endTrainingMutation,
    createTrainingMutation, 
    addPlayerMutation, removePlayerMutation, togglePaidMutation,
    initializeGameMutation, startGameMutation, replacePlayerMutation,
  } = useDashboard(user.token)

  const currentGame = training?.current_players || []
  const currentGameSkillGroup = training?.currentGameSkillGroup || ''

  const attendancePanelProps = {
    attendance,
    players,
    addPlayerMutation,
    removePlayerMutation,
    togglePaidMutation,
    togglePaid,
    paidIds,
    currentGame
  }

  const sharedGameProps = {
    currentGame,
    currentGameSkillGroup,
    training,
  }

  const sharedControlsProps = {
    attendance,
    training,
    handleInitializeGame,
    initializeGameMutation,
    startGameMutation,
    currentGame,
    replacePlayerMutation
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background font-sans text-foreground">
      <Header 
        dashboardQuery={dashboardQuery} 
        training={training} 
        createTrainingMutation={createTrainingMutation}
        handleCreateTraining={handleCreateTraining}
        endTrainingMutation={endTrainingMutation}
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
          <DashboardLayout
            attendancePanelProps={attendancePanelProps}
            sharedControlsProps={sharedControlsProps}
            sharedGameProps={ sharedGameProps }
            currentGame={currentGame}
            currentGameSkillGroup={currentGameSkillGroup}
            training={training}
            attendance={attendance}
            paidIds={paidIds}
          />
        )}
      </div>

      <BottomNav />
    </div>
  )
}

export default Dashboard
