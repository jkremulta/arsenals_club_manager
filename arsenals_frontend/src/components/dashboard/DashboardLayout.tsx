import AttendancePanel from "./AttendancePanel"
import GamePanel from "./GamePanel"
import ControlsPanel from "./ControlsPanel"
import { useUIStore } from "@/stores/useUIStore"

const DashboardLayout = ({ sharedAttendanceProps, sharedControlsProps, currentGame, currentGameSkillGroup, training }) => {
  const { activeTab } = useUIStore()

  return (
    <>
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
    </>
  )
}

export default DashboardLayout