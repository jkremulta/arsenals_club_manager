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
          accent="#2DD4BF"  // brighter teal
        />
        <StatCard
          icon={PhilippinePeso}
          label="Paid"
          value={`${paidIds.size} / ${attendance.length}`}
          accent="#2DD4BF"
          valueStyle={{ color: '#2DD4BF' }}
        />
        <StatCard
          icon={Trophy}
          label="Games Today"
          value={training.games_today}
          accent="#F97316"  // brighter orange
        />
        <StatCard
          icon={Clock}
          label="Session Start"
          value={helper.formatTime(training.startTime) ?? '—'}
          accent="#93C5FD"  // light blue-navy, readable on dark
        />
            </div>
          </div>
          )
        }

export default StatBar