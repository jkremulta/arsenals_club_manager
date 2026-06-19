import { useState } from 'react'
import helper from '../../utils/helper'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Zap, Loader2, ArrowLeftRight } from 'lucide-react'

const UpNextList = ({ training, attendance, currentGame, replacePlayerMutation }) => {
  const [swappingPlayerId, setSwappingPlayerId] = useState(null)
  const [swapOpenId, setSwapOpenId] = useState(null)
  
  const nextGamePlayers = training?.initialized_players || []
  const initializedSkillGroup = training?.initializedSkillGroup || ''
  const queuedIds = new Set(nextGamePlayers.map(p => p.id ?? p._id))
  const availableToSwap = attendance
    .filter(p => !queuedIds.has(p.id))
    .sort((a, b) => {
      const gamesA = a.games_played ?? 0
      const gamesB = b.games_played ?? 0
      if (gamesA !== gamesB) return gamesA - gamesB
      return a.name.localeCompare(b.name)
  })

  return (
    <div className="flex flex-1 min-h-0 flex-col border-2 border-black bg-violet-500/[0.04]">
        <div className="flex flex-shrink-0 items-center justify-between border-black border-b bg-violet-500/[0.05] px-4 py-3">
          <div className="flex items-center gap-2 text-violet-400">
            <p className="text-[11px] font-semibold uppercase tracking-widest">Up next</p>
          </div>
          {nextGamePlayers.length > 0 && initializedSkillGroup && (
            <span className="border-2 border-black/30 bg-violet-500/20 px-2.5 py-0.5 text-[10px] font-semibold capitalize text-violet-400">
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
                  <div key={playerId} className="group flex items-center justify-between rounded-md px-3 py-2 hover:bg-teal-500/10">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="w-5 text-[10px] font-bold text-violet-500/50">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span className="truncate text-[12px] font-medium text-foreground/80">{player.name}</span>
                        <span className={`flex-shrink-0 rounded-none border-2 border-black/30 px-1.5 py-0.5 text-[9px] font-bold ${helper.skillPill(player.skill).className}`}>
                          {helper.skillPill(player.skill).label}
                        </span>
                      </div>
                    </div>

                    <div className="ml-2 flex flex-shrink-0 items-center gap-2">
                      <span className={`rounded-none border-2 px-1.5 py-0.5 text-[10px] font-bold ${
                        isPlaying
                          ? 'border-black/30 text-emerald-400'
                          : 'border-black/30 text-muted-foreground/50'
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
                            className="opacity-100 flex h-6 w-6 items-center justify-center rounded-none border-2 border-black/30 text-muted-foreground/60 opacity-0 transition-all shadow-[2px_2px_0px_black] group-hover:opacity-100 hover:border-violet-500 hover:bg-violet-500/10 hover:text-violet-400 active:shadow-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50"
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
  )
}

export default UpNextList