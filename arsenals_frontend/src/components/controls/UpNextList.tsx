import { useState } from 'react'
import helper from '../../utils/helper'
import { Popover } from '@/components/retroui/Popover'
import { Command } from '@/components/retroui/Command'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Zap, Loader2, ArrowLeftRight } from 'lucide-react'

const UpNextList = ({ training, attendance, currentGame, replacePlayerMutation, handleReplacePlayer }) => {
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
    <div className="flex flex-1 min-h-0 flex-col border-2 border-black bg-card ">
      <div className="flex flex-shrink-0 items-center justify-between border-black border-b bg-card px-4 py-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <p className="text-[11px] font-semibold uppercase tracking-widest">Up next</p>
        </div>
        {nextGamePlayers.length > 0 && initializedSkillGroup && (
          <span className={`flex-shrink-0 rounded-none border-2 border-black/30 px-1 text-[9px] font-bold ${helper.skillPill(initializedSkillGroup).className}`}>
            {helper.skillLabel(initializedSkillGroup)}
          </span>
        )}
      </div>

      <ScrollArea className="flex-1 min-h-0">
        {nextGamePlayers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Zap size={20} className="mb-2 text-[#2e6a8e]/20" />
            <p className="text-xs text-muted-foreground">No players queued</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground/80">Select a skill group or team and initialize</p>
          </div>
        ) : (
          <div className="space-y-0.5 p-2">
            {nextGamePlayers.map((player, i) => {
              const playerId = player.id
              const isPlaying = currentGame?.some((p) => (p.id ?? p._id) === playerId)
              const swapLoading =
                replacePlayerMutation.isPending &&
                replacePlayerMutation.variables?.outPlayerId === playerId

              return (
                <div key={playerId} className="hover:rounded-none group flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="w-5 text-[10px] font-bold text-muted-foreground/60">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span className="truncate max-w-[110px] sm:max-w-[140px] md:max-w-[160px] text-[12px] font-medium text-foreground/80">{player.name}</span>
                      <span className={`flex-shrink-0 rounded-none border-2 border-black/30 px-1 text-[9px] font-bold ${helper.skillPill(player.skill).className}`}>
                        {helper.skillPill(player.skill).label}
                      </span>
                    </div>
                  </div>

                  <div className="ml-2 flex flex-shrink-0 items-center gap-2">
                    <span className={`rounded-none border-2 px-1.5 py-0.5 text-[10px] font-bold ${isPlaying
                      ? 'border-none'
                      : 'border-none text-muted-foreground/60'
                      }`}>
                      {player.games_played ?? 0}G
                    </span>
                    <Popover
                      open={swapOpenId === playerId}
                      onOpenChange={open => {
                        if (swapLoading) return
                        setSwapOpenId(open ? playerId : null)
                      }}
                    >
                      <Popover.Trigger
                        disabled={swapLoading}
                        className={`
                              flex h-6 w-6 items-center justify-center rounded-none 
                              border-2 border-black text-muted-foreground/60
                              opacity-100 transition-all 
                              shadow-[2px_2px_0px_black]
                              group-hover:opacity-100
                              hover:bg-accent hover:text-white
                              active:shadow-none active:translate-x-[2px] active:translate-y-[2px]
                              disabled:opacity-50
                              ${swapOpenId === playerId ? 'bg-accent text-white border-black' : ''}
                            `}
                      >
                        {swapLoading
                          ? <Loader2 size={11} className="animate-spin" />
                          : <ArrowLeftRight size={11} />}
                      </Popover.Trigger>
                      <Popover.Content className="w-64 p-0 rounded-none border-black" align="end">
                        <Command>
                          <Command.Input placeholder="Search player..." className="focus-visible:outline-none" />
                          <Command.List>
                            <Command.Empty className="py-3 text-center text-xs text-muted-foreground">No players available</Command.Empty>
                            <Command.Group>
                              {availableToSwap.map((p) => {
                                const isPlaying = currentGame?.some((cg) => (cg.id ?? cg._id) === p.id)
                                return (
                                  <Command.Item
                                    key={p.id}
                                    value={p.name}
                                    onSelect={() => {
                                      if (replacePlayerMutation.isPending) return

                                      handleReplacePlayer({
                                        outPlayerId: playerId,
                                        inPlayerId: p.id,
                                      })

                                      setSwapOpenId(null)
                                    }}
                                    className="hover:rounded-none cursor-pointer data-[selected=true]:bg-muted data-[selected=true]:text-foreground"
                                    disabled={swapLoading}
                                  >
                                    <div className="flex w-full items-center justify-between gap-2">
                                      <div className='flex gap-2'>
                                        <span className="truncate text-[13px]">{p.name}</span>
                                        <span className={`border-2 px-1 border-black/30 text-[9px] font-semibold ${helper.skillPill(p.skill).className}`}>
                                          {helper.skillPill(p.skill).label}
                                        </span>
                                      </div>

                                      <div className="flex flex-shrink-0 items-center gap-1">
                                        <span className={`rounded border px-1 py-0.5 text-[10px] ${isPlaying
                                          ? 'border-none'
                                          : 'border-none text-muted-foreground/60'
                                          }`}>
                                          {p.games_played ?? 0}G
                                        </span>
                                      </div>
                                    </div>
                                  </Command.Item>
                                )
                              })}
                            </Command.Group>
                          </Command.List>
                        </Command>
                      </Popover.Content>
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