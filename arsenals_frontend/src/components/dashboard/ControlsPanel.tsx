import GameControls from '../controls/GameControls'
import UpNextList from '../controls/UpNextList'

function ControlsPanel({
  attendance,
  training,
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
