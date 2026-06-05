import { useState } from 'react'
import helper from '../../utils/helper'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Play, Zap, Loader2, ArrowLeftRight } from 'lucide-react'
import { useUIStore } from '@/stores/useUIStore'

const SKILL_GROUPS = ['beginner', 'intermediate', 'advanced']

function ControlsPanel({
  attendance,
  training,
  teams,
  handleInitializeGame,
  initializeGameMutation,
  startGameMutation,
  currentGame,
  replacePlayerMutation
}) {

  const gamesBySkill =  training?.games_by_skill
  const initializedSkillGroup = training?.initializedSkillGroup || ''
  const initLoading = initializeGameMutation.isPending

  const [swapOpenId, setSwapOpenId] = useState(null)
  const [swappingPlayerId, setSwappingPlayerId] = useState(null)
  const [gameMode, setGameMode] = useState('skill')
  const [teamA, setTeamA] = useState('')
  const [teamB, setTeamB] = useState('')
  
  const { skillGroup, setSkillGroup } = useUIStore()

  const nextGamePlayers = training?.initialized_players || []
  const startGameLoading = startGameMutation.isPending
  const canStart = nextGamePlayers.length > 0 && !startGameLoading

  const queuedIds = new Set(nextGamePlayers.map(p => p.id ?? p._id))
  const availableToSwap = attendance
    .filter(p => !queuedIds.has(p.id))
    .sort((a, b) => {
      const gamesA = a.games_played ?? 0
      const gamesB = b.games_played ?? 0
      if (gamesA !== gamesB) return gamesA - gamesB
      return a.name.localeCompare(b.name)
    })
  const availableTeamsForA = teams?.filter((team) => team.id !== teamB)
  const availableTeamsForB = teams?.filter((team) => team.id !== teamA)

  const handleInitialize = () => {
    if (gameMode === 'skill') {
      handleInitializeGame({ skillGroup })
    } else {
      handleInitializeGame({ teamA, teamB })
    }
  }

  const canInitialize = gameMode === 'skill'
    ? (!initLoading && !!skillGroup)
    : (!initLoading && !!teamA && !!teamB)

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">

      {/* ── Game controls card ─────────────────────────────────────── */}
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

        {/* Mode toggle */}
        <div className="mb-3 flex rounded-lg border border-border bg-muted/40 p-0.5">
          {[
            { id: 'skill', label: 'By Skill' },
            { id: 'team',  label: 'By Team' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setGameMode(id)}
              className={`flex-1 rounded-md py-1.5 text-[11px] font-medium transition-all ${
                gameMode === id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground bg-card hover:text-foreground/80'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {gameMode === 'skill' ? (
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
          ) : (
            <div className="flex items-center gap-2">
  
          {/* Team A */}
          <Select value={teamA} onValueChange={setTeamA}>
            <SelectTrigger className="w-full border-border bg-card text-sm text-foreground focus:ring-0">
              <SelectValue placeholder="Team A" />
            </SelectTrigger>
            <SelectContent className="border-border bg-popover text-popover-foreground">
              {availableTeamsForA?.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Divider */}
          <span className="flex items-center justify-center px-2 text-muted-foreground">
            &
          </span>

          {/* Team B */}
          <Select value={teamB} onValueChange={setTeamB}>
            <SelectTrigger className="w-full border-border bg-card text-sm text-foreground focus:ring-0">
              <SelectValue placeholder="Team B" />
            </SelectTrigger>
            <SelectContent className="border-border bg-popover text-popover-foreground">
              {availableTeamsForB?.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

        </div>
          )}

          <Button
            className="w-full bg-violet-600/80 text-white hover:bg-violet-500 disabled:opacity-40"
            onClick={handleInitialize}
            disabled={!canInitialize}
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

      {/* ── Up next ─────────────────────────────────────────────────── */}
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
              <p className="text-xs text-muted-foreground">No players queued</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground/80">Select a skill group or team and initialize</p>
            </div>
          ) : (
            <div className="space-y-0.5 p-2">
              {nextGamePlayers.map((player, i) => {
                const playerId = player.id ?? player._id
                const isPlaying = currentGame?.some((p) => (p.id ?? p._id) === playerId)
                const isSwapping = swappingPlayerId === playerId
                return (
                  <div key={playerId} className="group flex items-center justify-between rounded-md px-3 py-2 hover:bg-accent/40">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="w-5 text-[10px] font-bold text-violet-500/50">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span className="truncate text-[12px] font-medium text-foreground/80">{player.name}</span>
                        <span className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold ${helper.skillPill(player.skill).className}`}>
                          {helper.skillPill(player.skill).label}
                        </span>
                      </div>
                    </div>

                    <div className="ml-2 flex flex-shrink-0 items-center gap-2">
                      <span className={`rounded border px-1.5 py-0.5 text-[10px] ${
                        isPlaying
                          ? 'border-emerald-500/25 text-emerald-400'
                          : 'border-border text-muted-foreground/50'
                      }`}>
                        {player.games_played ?? 0}G
                      </span>
                      <Popover
                        open={swapOpenId === playerId}
                        onOpenChange={open => {
                          if (isSwapping) return
                          setSwapOpenId(open ? playerId : null)
                        }}
                      >
                        <PopoverTrigger asChild>
                          <button
                            disabled={isSwapping}
                            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground/60 opacity-0 transition-all group-hover:opacity-100 hover:bg-violet-500/20 hover:text-violet-400 opacity-100 disabled:opacity-50"
                          >
                            {isSwapping
                              ? <Loader2 size={11} className="animate-spin" />
                              : <ArrowLeftRight size={11} />}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 border-border bg-popover p-0 text-popover-foreground" align="end">
                          <div className="border-b border-border px-3 py-2">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                              Replace {player.name}
                            </p>
                          </div>
                          <Command className="bg-popover text-popover-foreground">
                            <CommandInput placeholder="Search player..." className="border-b border-border bg-popover text-popover-foreground placeholder:text-muted-foreground" />
                            <CommandList>
                              <CommandEmpty className="py-3 text-center text-xs text-muted-foreground">No players available</CommandEmpty>
                              <CommandGroup>
                                {availableToSwap.map((p) => {
                                  const isPlaying = currentGame?.some((cg) => (cg.id ?? cg._id) === p.id)
                                  return (
                                    <CommandItem
                                      key={p.id}
                                      value={p.name}
                                      onSelect={async () => {
                                        if (isSwapping) return
                                        setSwappingPlayerId(playerId)
                                        try {
                                          replacePlayerMutation.mutateAsync({ outPlayerId: playerId, inPlayerId: p.id })
                                          setSwapOpenId(null)
                                        } finally {
                                          setSwappingPlayerId(null)
                                        }
                                      }}
                                      className="cursor-pointer text-popover-foreground aria-selected:bg-accent aria-selected:text-accent-foreground disabled:opacity-50"
                                      disabled={isSwapping}
                                    >
                                      <div className="flex w-full items-center justify-between gap-2">
                                        <span className="truncate text-[12px]">{p.name}</span>
                                        <div className="flex flex-shrink-0 items-center gap-1">
                                          <span className={`rounded border px-1 py-0.5 text-[9px] ${
                                            isPlaying
                                              ? 'border-emerald-500/25 text-emerald-400'
                                              : 'border-border text-muted-foreground/50'
                                          }`}>
                                            {p.games_played ?? 0}G
                                          </span>
                                          <span className={`rounded px-1 py-0.5 text-[9px] font-semibold ${helper.skillPill(p.skill).className}`}>
                                            {helper.skillPill(p.skill).label}
                                          </span>
                                        </div>
                                      </div>
                                    </CommandItem>
                                  )
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}

export default ControlsPanel
