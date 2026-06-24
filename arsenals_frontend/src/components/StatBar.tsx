import StatCard from "./statbar/StatCard";
import helper from "@/utils/helper";

import {Users, PhilippinePeso, Trophy, Clock } from 'lucide-react'

const StatBar = ({ attendance, paidIds, training }) => {
  return (
    <div className="flex-shrink-0 px-4 pt-4 md:px-8 md:pt-5">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        <StatCard
          icon={Users}
          label="Attendance"
          value={attendance.length}
          accent="#e8d9b5"  // cream — neutral, always present
        />
        <StatCard
          icon={PhilippinePeso}
          label="Paid"
          value={`${paidIds.size} / ${attendance.length}`}
          accent="#93c5d8"  // logo teal
          valueStyle={{ color: "#93c5d8" }}
        />
        <StatCard
          icon={Trophy}
          label="Games Today"
          value={training.games_today}
          accent="#c47a1e"  // logo burnt orange — trophy feels right here
        />
        <StatCard
          icon={Clock}
          label="Session Start"
          value={helper.formatTime(training.startTime) ?? '—'}
          accent="#e8d9b5"  // cream again — time is neutral info
        />
      </div>
    </div>
          )
        }

export default StatBar