import helper from '../utils/helper'
import { Button } from '@/components/ui/button'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Play, Zap, Loader2 } from 'lucide-react'

const SKILL_GROUPS = ['beginner', 'intermediate', 'advanced']

function ControlsPanel({
  skillGroup, setSkillGroup, initializedSkillGroup,
  nextGamePlayers, initLoading, startLoading,
  onInitialize, onStartGame
}) {
  // Start Game is only enabled when there are queued players
  const canStart = nextGamePlayers.length > 0 && !startLoading

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">

      {/* ── Game controls card ─────────────────────────────────────────── */}
      <div className="flex-shrink-0 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/55">Game Controls</p>
        <p className="mb-3 mt-0.5 text-[11px] text-white/30">Initialize then start</p>

        <div className="flex flex-col gap-2">
          <Select value={skillGroup} onValueChange={setSkillGroup}>
            <SelectTrigger className="w-full border-white/10 bg-white/5 text-sm text-white/70 focus:ring-0 focus:ring-offset-0">
              <SelectValue placeholder="Select skill group" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[#141414] text-white">
              {SKILL_GROUPS.map((g) => (
                <SelectItem key={g} value={g} className="capitalize hover:bg-white/10 focus:bg-white/10">
                  {helper.capitalize(g)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            className="w-full bg-violet-600/80 text-white hover:bg-violet-500 disabled:opacity-40"
            onClick={onInitialize}
            disabled={initLoading || !skillGroup}
          >
            {initLoading
              ? <Loader2 size={14} className="mr-2 animate-spin" />
              : <Zap size={14} className="mr-2" />}
            Initialize
          </Button>

          <Button
            className="w-full bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40"
            onClick={onStartGame}
            disabled={!canStart}
          >
            {startLoading
              ? <Loader2 size={14} className="mr-2 animate-spin" />
              : <Play size={14} className="mr-2" />}
            Start Game
          </Button>
        </div>
      </div>

      {/* ── Up next — always visible ───────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 flex-col rounded-xl border border-violet-500/25 bg-violet-500/[0.04]">
        <div className="flex flex-shrink-0 items-center justify-between border-b border-violet-500/15 bg-violet-500/[0.05] px-4 py-3">
          <div className="flex items-center gap-2 text-violet-400">
            <Zap size={12} />
            <p className="text-[11px] font-semibold uppercase tracking-widest">Up next</p>
          </div>
          {nextGamePlayers.length > 0 && initializedSkillGroup && (
            <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-[10px] font-semibold capitalize text-violet-400">
              {initializedSkillGroup}
            </span>
          )}
        </div>

        <ScrollArea className="flex-1 min-h-0">
          {nextGamePlayers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Zap size={20} className="mb-2 text-violet-500/20" />
              <p className="text-xs text-white/25">No players queued</p>
              <p className="mt-0.5 text-[11px] text-white/15">Select a skill group and initialize</p>
            </div>
          ) : (
            <div className="space-y-0.5 p-2">
              {nextGamePlayers.map((player, i) => (
                <div key={player.id ?? player._id} className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-white/[0.03]">
                  <span className="w-5 text-[10px] font-bold text-violet-500/50">
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

    </div>
  )
}

export default ControlsPanel