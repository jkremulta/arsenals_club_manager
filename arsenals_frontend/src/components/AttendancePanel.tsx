import { useState } from 'react'
import helper from '../utils/helper'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Users, UserPlus, Loader2, X, ChevronDown } from 'lucide-react'

function AttendancePanel({ attendance, availablePlayers, paidIds, currentGame, removingId, onAdd, onRemove, onTogglePaid }) {
  const [addOpen, setAddOpen] = useState(false)
  const [addLoading, setAddLoading] = useState(false)

  const handleAdd = async (id) => {
    setAddLoading(true)
    setAddOpen(false)
    try {
      await onAdd(id)
    } finally {
      setAddLoading(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-white/[0.06] bg-white/[0.02]">
      <div className="flex flex-shrink-0 items-center justify-between px-4 py-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/55">
            Attendance
          </p>
          <p className="mt-0.5 text-[11px] text-white/30">
            {attendance.length} player{attendance.length !== 1 ? 's' : ''} — tap pill to mark paid
          </p>
        </div>
        <Popover open={addOpen} onOpenChange={setAddOpen}>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              disabled={addLoading}
              className="h-8 border-white/10 bg-white/5 text-xs text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              {addLoading
                ? <Loader2 size={12} className="mr-1.5 animate-spin" />
                : <UserPlus size={12} className="mr-1.5" />}
              Add
              {!addLoading && <ChevronDown size={10} className="ml-1 text-white/30" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 border-white/10 bg-[#141414] p-0" align="end">
            <Command className="bg-transparent">
              <CommandInput
                placeholder="Search player..."
                className="border-b border-white/10 text-white placeholder:text-white/30"
              />
              <CommandList>
                <CommandEmpty className="py-4 text-center text-xs text-white/30">
                  No players available
                </CommandEmpty>
                <CommandGroup>
                  {availablePlayers.map((p) => (
                    <CommandItem
                      key={p.id}
                      value={p.name}
                      onSelect={() => handleAdd(p.id)}
                      className="cursor-pointer text-white/70 aria-selected:bg-white/10 aria-selected:text-white"
                    >
                      <span className="text-sm">{p.name}
                        <span className={`ml-2 rounded px-1.5 py-0.5 text-[9px] font-semibold ${helper.skillPill(p.skill).className}`}>
                          {helper.skillPill(p.skill).label}
                        </span>
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <Separator className="bg-white/[0.05]" />

      <ScrollArea className="flex-1 min-h-0">
        {attendance.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <Users size={22} className="mb-2 text-white/10" />
            <p className="text-xs text-white/30">No players yet</p>
          </div>
        ) : (
          <div className="space-y-0.5 p-2">
            {attendance.map((player) => {
              const isPaid = paidIds.has(player.id)
              const isPlaying = currentGame?.some((p) => p.id === player.id)
              return (
                <div
                  key={player.id}
                  className="group flex items-center justify-between rounded-md px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="truncate text-[13px] font-medium text-white/75">{player.name}</span>
                    <span className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold ${helper.skillPill(player.skill).className}`}>
                      {helper.skillPill(player.skill).label}
                    </span>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <span className={`rounded border px-1.5 py-0.5 text-[10px] ${isPlaying ? 'border-emerald-500/25 text-emerald-400' : 'border-white/[0.08] text-white/30'}`}>
                      {player.games_played ?? 0}G
                    </span>
                    <button
                      onClick={() => onTogglePaid(player.id)}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all ${
                        isPaid
                          ? 'bg-emerald-500/15 text-emerald-400 hover:bg-red-500/[0.12] hover:text-red-400'
                          : 'bg-white/[0.06] text-white/30 hover:bg-emerald-500/15 hover:text-emerald-400'
                      }`}
                    >
                      {isPaid ? 'Paid' : 'Unpaid'}
                    </button>
                    <button
                      onClick={() => onRemove(player.id)}
                      disabled={removingId === player.id}
                      className="flex h-6 w-6 items-center justify-center rounded text-white/20 transition-opacity hover:bg-red-500/20 hover:text-red-400 md:group-hover:opacity-100"
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