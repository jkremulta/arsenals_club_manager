import GameControls from './GameControls'
import UpNextList from './UpNextList'

function ControlsPanel({
  attendance,
  training,
  teams,
  handleInitializeGame,
  initializeGameMutation,
  startGameMutation,
  currentGame,
  replacePlayerMutation
}) {

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">

      <GameControls
        training={training}
        teams={teams}
        handleInitializeGame={handleInitializeGame}
        initializeGameMutation={initializeGameMutation}
        startGameMutation={startGameMutation}
      />

      <UpNextList
        training={training}
        attendance={attendance}
        currentGame={currentGame}
        replacePlayerMutation={replacePlayerMutation}
      />
      
    </div>
  )
}

export default ControlsPanel
