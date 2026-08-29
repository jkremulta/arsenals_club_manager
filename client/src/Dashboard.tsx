import Header from './components/Header'
import BottomNav from './components/dashboard/BottomNav'
import { useDashboard } from './hooks/useDashboard'

import DashboardLoading from './components/dashboard/DashboardLoading'
import DashboardEmpty from './components/dashboard/DashboardEmpty'
import DashboardLayout from './components/dashboard/DashboardLayout'

const Dashboard = ({ user }) => {
  const {
    dashboardLoading, training, attendance, players, paidIds,
    endTrainingMutation,
    createTrainingMutation,
    addPlayerMutation, removePlayerMutation, togglePaidMutation,
    initializeGameMutation, startGameMutation, replacePlayerMutation,

    handleTogglePaid,
    handleCreateTraining,
    handleInitializeGame,
    handleAddPlayer,
    handleRemovePlayer,
    handleStartGame,
    handleReplacePlayer

  } = useDashboard(user.token)

  const currentGame = training?.current_players || []
  const currentGameSkillGroup = training?.currentGameSkillGroup || ''

  const attendancePanelProps = {
    attendance,
    players,
    addPlayerMutation,
    removePlayerMutation,
    togglePaidMutation,
    paidIds,
    currentGame,

    handleAddPlayer,
    handleRemovePlayer,
    handleStartGame,
    handleTogglePaid,
  }

  const sharedGameProps = {
    currentGame,
    currentGameSkillGroup,
    training,
  }

  const sharedControlsProps = {
    attendance,
    training,
    initializeGameMutation,
    startGameMutation,
    currentGame,
    replacePlayerMutation,

    handleInitializeGame,
    handleStartGame,
    handleReplacePlayer
  }

  return (
    <div className="h-screen overflow-hidden bg-card p-4">
      <div className="flex h-full flex-col border-2 border-black bg-background font-sans text-foreground shadow-[6px_6px_0_#000]">
        <Header
          dashboardLoading={dashboardLoading}
          training={training}
          createTrainingMutation={createTrainingMutation}
          handleCreateTraining={handleCreateTraining}
          endTrainingMutation={endTrainingMutation} />

        <div className="flex flex-1 flex-col overflow-hidden">
          {dashboardLoading ? (
            <DashboardLoading />
          ) : !training ? (
            <DashboardEmpty />
          ) : (
            <DashboardLayout
              attendancePanelProps={attendancePanelProps}
              sharedControlsProps={sharedControlsProps}
              sharedGameProps={sharedGameProps}
              training={training}
              attendance={attendance}
              paidIds={paidIds}
            />
          )}
        </div>

        <BottomNav />
      </div>
    </div>
  )
}

export default Dashboard
