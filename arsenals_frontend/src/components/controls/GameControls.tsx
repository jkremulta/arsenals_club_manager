import { Select } from "@/components/retroui/Select";
import { Button } from '@/components/retroui/Button'
import { Loader2 } from 'lucide-react'

import { useUIStore } from '@/stores/useUIStore'
import helper from '../../utils/helper'


const GameControls = ({ training, initializeGameMutation, startGameMutation }) => {
  const SKILL_GROUPS = ['beginner', 'intermediate', 'advanced']
  const gamesBySkill =  training?.games_by_skill
  const initLoading = initializeGameMutation.isPending
    
  const { skillGroup, setSkillGroup } = useUIStore()

  const nextGamePlayers = training?.initialized_players || []
  const startGameLoading = startGameMutation.isPending
  const canStart = nextGamePlayers.length > 0 && !startGameLoading

  return (
    <div className="flex-shrink-0 border-2 border-black bg-card p-4">
        <div className="flex justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Game Controls</p>
          <div className="flex gap-2">
            {SKILL_GROUPS.map((skill) => {
              const count = gamesBySkill?.[skill] ?? 0
              const { label, className } = helper.skillPill(skill)
              return (
                <span key={skill} className={`flex-shrink-0 border-2 border-black/30 px-1.5 py-0.5 text-[9px] font-semibold ${className}`}>
                  {label} · {count}
                </span>
              )
            })}
          </div>
        </div>
        <p className="mb-3 mt-0.5 text-[11px] text-muted-foreground/60">Initialize then start</p>

        <div className="flex flex-col gap-2">
            <Select value={helper.capitalize(skillGroup)} onValueChange={setSkillGroup}>
              <Select.Trigger className="w-full border-2 border-black bg-card text-sm text-foreground focus:ring-0 focus:ring-offset-0">
                <Select.Value placeholder="Select skill group" />
              </Select.Trigger>
              <Select.Content className="border-2 border-black text-sm">
                {SKILL_GROUPS.map(g => (
                  <Select.Item key={g} value={g} className="capitalize data-[highlighted]:bg-white/10 data-[highlighted]:text-foreground">
                    {helper.capitalize(g)}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>

          <Button
            size="sm"
            className="font-sans w-full bg-[#93c5d8] h-8 text-black disabled:opacity-40"
            onClick={() => initializeGameMutation.mutate({ skillGroup })}
          >
            {initLoading ? <Loader2 size={12} className="animate-spin" /> : 'Initialize'}
          </Button>
          <Button
            size="sm"
            className="font-sans w-full bg-emerald-400 h-8 text-black disabled:opacity-40"
            onClick={() => startGameMutation.mutate()}
            disabled={!canStart}
          >
            {startGameLoading ? <Loader2 size={12} className="animate-spin" /> : 'Start Game'}
          </Button>
        </div>
      </div>
  )
}

export default GameControls