import helper from '../../utils/helper'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Play, Shield } from 'lucide-react'

function GamePanel({ currentGame, currentGameSkillGroup, training }) {
  // show team name if team game, otherwise skill group
  const teamA = training?.team_a
  const teamB = training?.team_b
  const currentGameTeam= training?.currentGameTeam

  const isTeamGame = (!!teamA && !!teamB) || !!currentGameTeam
  const pillLabel = isTeamGame
    ? [teamA?.name, teamB?.name].filter(Boolean).join(' vs ')
    : currentGameSkillGroup

  return (
   <div className="flex h-full min-h-0 flex-col border-2 border-black bg-teal-500/[0.03]">
    <div className="flex flex-shrink-0 items-center justify-between border-b-2 border-black bg-teal-500/[0.04] px-4 py-3">
      <div className="flex items-center gap-2 text-teal-400">
        <p className="text-[11px] font-semibold uppercase tracking-widest">Game in progress</p>
      </div> 
        <span className="flex items-center gap-1.5 rounded-none border-2 border-black/30 bg-teal-500/15 px-2.5 py-0.5 text-[10px] font-bold capitalize text-teal-400">
          {pillLabel}
        </span>
      </div>

      <ScrollArea className="flex-1 overflow-hidden">
        {!currentGame || currentGame.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <Play size={22} className="mb-2 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground">No game running</p>
            <p className="mt-1 text-[11px] text-muted-foreground/80">Initialize and start a game</p>
          </div>
        ) : (
          <div className="space-y-0.5 p-2">
            {currentGame.map((player, i) => (
              <div key={player.id} className="flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-teal-500/10">
                <span className="w-5 text-[10px] font-bold text-teal-500/50">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <span className="truncate text-[13px] font-medium text-foreground/80">{player.name}</span>
                  <span className={`flex-shrink-0 rounded-none border-2 border-black/30 px-1.5 py-0.5 text-[9px] font-bold ${helper.skillPill(player.skill).className}`}>
                    {helper.skillPill(player.skill).label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

export default GamePanel
