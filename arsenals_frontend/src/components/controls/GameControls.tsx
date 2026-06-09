import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Play, Zap, Loader2 } from 'lucide-react'

import { useUIStore } from '@/stores/useUIStore'
import helper from '../../utils/helper'


const GameControls = ({ training, handleInitializeGame, initializeGameMutation, startGameMutation }) => {
  const SKILL_GROUPS = ['beginner', 'intermediate', 'advanced']
  const gamesBySkill =  training?.games_by_skill
  const initLoading = initializeGameMutation.isPending
    
  const { skillGroup, setSkillGroup } = useUIStore()

  const nextGamePlayers = training?.initialized_players || []
  const startGameLoading = startGameMutation.isPending
  const canStart = nextGamePlayers.length > 0 && !startGameLoading

  return (
    <div className="flex-shrink-0 rounded-xl border border-border bg-card p-4">
        <div className="flex justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-foreground/70">Game Controls</p>
          <div className="flex gap-2">
            {SKILL_GROUPS.map((skill) => {
              const count = gamesBySkill?.[skill] ?? 0
              const { label, className } = helper.skillPill(skill)
              return (
                <span key={skill} className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold ${className}`}>
                  {label} · {count}
                </span>
              )
            })}
          </div>
        </div>
        <p className="mb-3 mt-0.5 text-[11px] text-muted-foreground">Initialize then start</p>

        <div className="flex flex-col gap-2">
            <Select value={skillGroup} onValueChange={setSkillGroup}>
              <SelectTrigger className="w-full border-border bg-card text-sm text-foreground focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Select skill group" />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover text-popover-foreground">
                {SKILL_GROUPS.map(g => (
                  <SelectItem key={g} value={g} className="capitalize">
                    {helper.capitalize(g)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

          <Button
            className="w-full bg-violet-600/80 text-white hover:bg-violet-500 disabled:opacity-40"
            onClick={() => {
                handleInitializeGame({ skillGroup })
              }
            }
          >
            {initLoading
              ? <Loader2 size={14} className="mr-2 animate-spin" />
              : <Zap size={14} className="mr-2" />}
            Initialize
          </Button>

          <Button
            className="w-full bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40"
            onClick={() => startGameMutation.mutate()}
            disabled={!canStart}
          >
            {startGameLoading
              ? <Loader2 size={14} className="mr-2 animate-spin" />
              : <Play size={14} className="mr-2" />}
            Start Game
          </Button>
        </div>
      </div>
  )
}

export default GameControls