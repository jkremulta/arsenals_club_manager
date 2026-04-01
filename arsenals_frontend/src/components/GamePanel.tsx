import helper from '@/utils/helper'
import { ScrollArea } from '@/components/ui/scroll-area'
 
import {
  Play,
} from 'lucide-react'

function GamePanel({ currentGame, currentGameSkillGroup }) {
  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03]">
      <div className="flex flex-shrink-0 items-center justify-between border-b border-emerald-500/10 bg-emerald-500/[0.04] px-4 py-3">
        <div className="flex items-center gap-2 text-emerald-400">
          <Play size={13} />
          <p className="text-[11px] font-semibold uppercase tracking-widest">Game in progress</p>
        </div>
        {currentGameSkillGroup && (
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-semibold capitalize text-emerald-400">
            {currentGameSkillGroup}
          </span>
        )}
      </div>
      <ScrollArea className="flex-1 overflow-hidden">
        {!currentGame || currentGame.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <Play size={22} className="mb-2 text-white/10" />
            <p className="text-xs text-white/30">No game running</p>
            <p className="mt-1 text-[11px] text-white/20">Initialize and start a game</p>
          </div>
        ) : (
          <div className="space-y-0.5 p-2">
            {currentGame.map((player, i) => (
              <div key={player._id} className="flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-white/[0.03]">
                <span className="w-5 text-[10px] font-bold text-emerald-500/50">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="truncate text-[13px] font-medium text-white/75">{player.name}</span>
                  <span className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold ${helper.skillPill(player.skill).className}`}>
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