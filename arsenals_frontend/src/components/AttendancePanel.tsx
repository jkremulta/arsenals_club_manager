import { useState } from 'react'
import helper from '../utils/helper'
import { Button } from '@/components/ui/button'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Users, UserPlus, Loader2, X, ChevronDown } from 'lucide-react'

function AttendancePanel({ attendance, availablePlayers, paidIds, currentGame, removingId, onAdd, onRemove, onTogglePaid }) {
  const [addOpen, setAddOpen] = useState(false)
  const [addLoading, setAddLoading] = useState(false)

  const sortedAttendance = [...attendance].sort((a, b) => {
    const gamesA = a.games_played ?? 0
    const gamesB = b.games_played ?? 0
    if (gamesA !== gamesB) return gamesA - gamesB
    return a.name.localeCompare(b.name)
  })

  const sortedAvailablePlayers = [...availablePlayers].sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  const handleAdd = async (id) => {
    setAddLoading(true)
    setAddOpen(false)
    try { await onAdd(id) }
    finally { setAddLoading(false) }
  }

  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-border bg-card">
      <div className="flex flex-shrink-0 items-center justify-between px-4 py-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Attendance
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground/60">
            {attendance.length} player{attendance.length !== 1 ? 's' : ''} — tap pill to mark paid
          </p>
        </div>
        <Popover open={addOpen} onOpenChange={setAddOpen}>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              disabled={addLoading}
              className="h-8 text-xs disabled:opacity-50"
            >
              {addLoading
                ? <Loader2 size={12} className="mr-1.5 animate-spin" />
                : <UserPlus size={12} className="mr-1.5" />}
              Add
              {!addLoading && <ChevronDown size={10} className="ml-1 text-muted-foreground" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="end">
            <Command>
              <CommandInput placeholder="Search player..." />
              <CommandList>
                <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">
                  No players available
                </CommandEmpty>
                <CommandGroup>
                  {sortedAvailablePlayers.map((p) => (
                    <CommandItem
                      key={p.id}
                      value={p.name}
                      onSelect={() => handleAdd(p.id)}
                      className="cursor-pointer"
                    >
                      <span className="text-sm">{p.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <Separator />

      <ScrollArea className="flex-1 min-h-0">
        {attendance.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <Users size={22} className="mb-2 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">No players yet</p>
          </div>
        ) : (
          <div className="space-y-0.5 p-2">
            {sortedAttendance.map((player) => {
              const isPaid = paidIds.has(player.id)
              const isPlaying = currentGame?.some((p) => p.id === player.id)
              return (
                <div
                  key={player.id}
                  className="group flex items-center justify-between rounded-md px-3 py-2.5 transition-colors hover:bg-accent"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="truncate text-[13px] font-medium text-foreground/75">{player.name}</span>
                    <span className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold ${helper.skillPill(player.skill).className}`}>
                      {helper.skillPill(player.skill).label}
                    </span>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <span className={`rounded border px-1.5 py-0.5 text-[10px] ${
                      isPlaying
                        ? 'border-emerald-500/25 text-emerald-400'
                        : 'border-border text-muted-foreground/50'
                    }`}>
                      {player.games_played ?? 0}G
                    </span>
                    <button
                      onClick={() => onTogglePaid(player.id)}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all ${
                        isPaid
                          ? 'bg-emerald-500/15 text-emerald-400 hover:bg-red-500/[0.12] hover:text-red-400'
                          : 'bg-muted text-muted-foreground hover:bg-emerald-500/15 hover:text-emerald-400'
                      }`}
                    >
                      {isPaid ? 'Paid' : 'Unpaid'}
                    </button>
                    <button
                      onClick={() => onRemove(player.id)}
                      disabled={removingId === player.id}
                      className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground/40 transition-opacity hover:bg-red-500/20 hover:text-red-400"
                    >
                      {removingId === player.id
                        ? <Loader2 size={10} className="animate-spin" />
                        : <X size={11} />}
                    </button>
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

export default AttendancePanel