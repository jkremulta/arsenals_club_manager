import StatCard from "./StatCard";
import helper from "@/utils/helper";

import {Users, ShieldCheck, Trophy, Clock } from 'lucide-react'

const StatBar = ({ attendance, paidIds, training }) => {
  return (
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
  )
}

export default StatBar