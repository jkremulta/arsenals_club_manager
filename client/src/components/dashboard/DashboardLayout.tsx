import AttendancePanel from "./AttendancePanel"
import GamePanel from "./GamePanel"
import ControlsPanel from "./ControlsPanel"
import { useUIStore } from "@/stores/useUIStore"
import StatBar from "../StatBar"

const DashboardLayout = ({ attendance, paidIds, attendancePanelProps, sharedControlsProps, sharedGameProps, currentGame, currentGameSkillGroup, training }) => {
  const { activeTab } = useUIStore()

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
    <StatBar attendance={attendance} paidIds={paidIds} training={training} />

     <div className="mx-auto hidden w-full max-w-7xl flex-1 gap-4 overflow-hidden px-8 py-4 md:grid md:grid-cols-3">
        <AttendancePanel {...attendancePanelProps} />

        <GamePanel {...sharedGameProps}/>

        <ControlsPanel {...sharedControlsProps} />
      </div>

      {/* ── Mobile: tab content ──────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden px-4 py-3 md:hidden">
        {activeTab === 'attendance' && (
          <AttendancePanel {...attendancePanelProps} />
        )}

        {activeTab === 'game' && (
          <GamePanel {...sharedGameProps}
          />
        )}

        {activeTab === 'controls' && (
          <ControlsPanel {...sharedControlsProps} />
        )}
      </div>
    </div>
  )
}

export default DashboardLayout