import helper from '../../utils/helper'
import { Popover } from "@/components/retroui/Popover";
import { Command } from "@/components/retroui/Command";
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Button } from '../retroui/Button';
import { Users, UserPlus, Loader2, X, ChevronDown, Check } from 'lucide-react'
import { useState } from 'react'

function AttendancePanel({ attendance, players, addPlayerMutation, removePlayerMutation, togglePaidMutation, handleTogglePaid, paidIds, currentGame, handleAddPlayer, handleRemovePlayer }) {
  const [attendanceAddOpen, setAttendanceAddOpen] = useState(false)
  const [removeConfirmId, setRemoveConfirmId] = useState(null)

  const sortedAttendance = [...attendance].sort((a, b) => {
    const gamesA = a.games_played ?? 0
    const gamesB = b.games_played ?? 0
    if (gamesA !== gamesB) return gamesA - gamesB
    return a.name.localeCompare(b.name)
  })

  const attendanceIds = new Set(attendance.map(p => p.id))
  const availablePlayers = players.filter(p => !attendanceIds.has(p.id))
  const sortedAvailablePlayers = [...availablePlayers].sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  const handleAdd = (id) => {
    setAttendanceAddOpen(false)
    handleAddPlayer(id)
  }


  const addLoading = addPlayerMutation.isPending
  const removePlayerLoading = removePlayerMutation.isPending ? removePlayerMutation.variables : null
  const togglePaidLoading = togglePaidMutation.isPending ? togglePaidMutation.variables?.id : null

  return (
    <div className="border-2 border-black flex h-full min-h-0 flex-col bg-card">
      <div className="flex flex-shrink-0 items-center justify-between px-4 py-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Attendance
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground/60">
            {attendance.length} player{attendance.length !== 1 ? 's' : ''} — tap pill to mark paid
          </p>
        </div>
        <Popover open={attendanceAddOpen} onOpenChange={setAttendanceAddOpen}>
          <Popover.Trigger
            disabled={addLoading}
            className="h-8 text-xs flex items-center gap-1 border-2 border-black px-3 bg-card disabled:opacity-50 font-medium shadow-[2px_2px_0px_black] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
          >
            {addLoading
              ? <Loader2 size={12} className="animate-spin" />
              : <UserPlus size={12} />}
            Add
            {!addLoading && <ChevronDown size={10} className="text-muted-foreground" />}
          </Popover.Trigger>
          <Popover.Content className="w-64 p-0 border-black" align="end">
            <Command>
              <Command.Input placeholder="Search player..." className="focus-visible:outline-none" />
              <Command.List>
                <Command.Empty className="py-4 text-center text-xs text-muted-foreground">
                  No players available
                </Command.Empty>
                <Command.Group>
                  {sortedAvailablePlayers.map((p) => (
                    <Command.Item
                      key={p.id}
                      value={p.name}
                      onSelect={() => handleAdd(p.id)}
                      className="cursor-pointer hover:bg-muted hover:text-foreground data-[selected=true]:bg-muted data-[selected=true]:text-foreground"
                    >
                      <span className="text-sm">{p.name}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>
            </Command>
          </Popover.Content>
        </Popover>
      </div>

      <Separator className='border-1 border-black bg-black' />

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
                  className="group flex items-center justify-between gap-2 rounded-md px-2 sm:px-3 py-2.5 transition-colors hover:rounded-none hover:bg-muted"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span
                      className={`truncate max-w-[110px] sm:max-w-[140px] md:max-w-[160px] text-[13px] font-medium ${player.late ? 'text-yellow-400' : 'text-foreground/75'
                        }`}
                    >
                      {player.name}
                    </span>
                    <span className={`flex-shrink-0 border-2 border-black/30 px-1 text-[9px] font-bold ${helper.skillPill(player.skill).className}`}>
                      {helper.skillPill(player.skill).label}
                    </span>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1.5">
                    <span className={`rounded-none border-2 px-1.5 py-0.5 text-[10px] font-bold ${isPlaying
                      ? 'border-none'
                      : 'border-none text-muted-foreground/60'
                      }`}>
                      {player.games_played ?? 0}G
                    </span>
                    <Button
                      size='sm'
                      onClick={() => handleTogglePaid(player.id)}
                      className={`px-2 py-0.5 text-[10px] ${togglePaidLoading === player.id
                        ? isPaid
                          ? "bg-red-400 text-black"
                          : "bg-emerald-400 text-black"
                        : isPaid
                          ? "bg-emerald-400 text-black hover:bg-red-400 hover:text-black"
                          : "bg-card text-muted-foreground hover:bg-emerald-400 hover:text-black"
                        }`}
                    >
                      {togglePaidLoading === player.id
                        ? <Loader2 size={10} className="animate-spin" />
                        : isPaid ? 'Paid' : 'Unpaid'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (removeConfirmId === player.id) {
                          handleRemovePlayer(player.id)
                          setRemoveConfirmId(null)
                        } else {
                          setRemoveConfirmId(player.id)
                        }
                      }}
                      disabled={removePlayerLoading === player.id}
                      className={`p-1 ${removeConfirmId === player.id
                          ? 'bg-red-400 text-black'
                          : 'bg-card text-muted-foreground hover:bg-red-400 hover:text-black'
                        }`}
                    >
                      {removePlayerLoading === player.id ? (
                        <Loader2 size={10} className="animate-spin" />
                      ) : removeConfirmId === player.id ? (
                        <Check size={11} />
                      ) : (
                        <X size={11} />
                      )}
                    </Button>
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