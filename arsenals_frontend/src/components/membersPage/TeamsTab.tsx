import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command'
import { Shield, Plus, Pencil, Loader2, X, UserPlus, ChevronDown } from 'lucide-react'
import helper from '@/utils/helper'
import DeleteButton from './DeleteButton'

function TeamsTab({
  teams, teamsLoading,
  attendance,
  newTeamName, setNewTeamName,
  creatingTeam,
  deletingTeamId,
  addingToTeam,
  removingFromTeam,
  renamingTeamId, setRenamingTeamId,
  renameValue, setRenameValue,
  renamingLoading,
  collapsedTeams,
  onCreateTeam,
  onDeleteTeam,
  onAddToTeam,
  onRemoveFromTeam,
  onRenameTeam,
  onToggleCollapse,
}) {
  const [teamPopoverOpen, setTeamPopoverOpen] = useState(null)

  return (
    <>
      {/* Create team */}
      <div className="flex-shrink-0 flex gap-2">
        <Input
          value={newTeamName}
          onChange={e => setNewTeamName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onCreateTeam()}
          placeholder="New team name..."
          className="flex-1 border-input bg-card text-sm placeholder:text-sm placeholder:text-muted-foreground/50 md:text-base md:placeholder:text-base focus-visible:ring-0"
        />
        <Button
          size='sm'
          onClick={onCreateTeam}
          disabled={creatingTeam || !newTeamName.trim()}
          className="bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40"
        >
          {creatingTeam ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} className="mr-1.5" />}
          Create Team
        </Button>
      </div>

      {/* Teams list */}
      <ScrollArea className="flex-1 min-h-0">
        {teamsLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin text-muted-foreground/40" />
          </div>
        ) : teams.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Shield size={24} className="mb-2 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No teams yet</p>
            <p className="mt-1 text-xs text-muted-foreground/60">Create a team above to get started</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {teams.map(team => {
              const isCollapsed = collapsedTeams.has(team.id)
              const allTeamPlayerIds = new Set(teams.flatMap(t => t.players.map(p => p.id)))
              const availableForTeam = attendance
                .filter(p => !allTeamPlayerIds.has(p.id))
                .sort((a, b) => a.name.localeCompare(b.name))
              const teamIsFull = team.players.length >= 7

              return (
                <div key={team.id} className="rounded-xl border border-border bg-card overflow-hidden">
                  {/* Team header */}
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer select-none transition-colors hover:bg-accent/50"
                    onClick={() => onToggleCollapse(team.id)}
                  >
                    {renamingTeamId === team.id ? (
                      <div className="flex flex-1 items-center gap-2 mr-2" onClick={e => e.stopPropagation()}>
                        <Input
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') onRenameTeam(team.id)
                            if (e.key === 'Escape') { setRenamingTeamId(null); setRenameValue('') }
                          }}
                          autoFocus
                          className="h-7 border-input bg-card text-sm focus-visible:ring-0"
                        />
                        <Button
                          size="sm"
                          onClick={() => onRenameTeam(team.id)}
                          disabled={renamingLoading === team.id}
                          className="h-7 bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40"
                        >
                          {renamingLoading === team.id && <Loader2 size={12} className="mr-1 animate-spin" />}
                          Save
                        </Button>
                        <button
                          onClick={() => { setRenamingTeamId(null); setRenameValue('') }}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 min-w-0">
                        <ChevronDown
                          size={14}
                          className={`flex-shrink-0 text-muted-foreground/40 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
                        />
                        <Shield size={14} className="flex-shrink-0 text-muted-foreground/60" />
                        <span className="font-semibold text-[14px] text-foreground/85 truncate">{team.name}</span>
                        <span className="text-[11px] text-muted-foreground/50 flex-shrink-0">{team.players.length} players</span>
                      </div>
                    )}
                    <div className="flex flex-shrink-0 items-center gap-1.5" onClick={e => e.stopPropagation()}>
                      {/* Add player */}
                      <Popover
                        open={teamPopoverOpen === team.id}
                        onOpenChange={open => setTeamPopoverOpen(open ? team.id : null)}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={addingToTeam === team.id || teamIsFull}
                            className="h-7 text-xs"
                          >
                            {addingToTeam === team.id
                              ? <Loader2 size={11} className="animate-spin" />
                              : <UserPlus size={11} className="mr-1" />}
                            Add
                            <ChevronDown size={9} className="ml-1 text-muted-foreground" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-60 p-0" align="end">
                          <Command>
                            <CommandInput placeholder="Search player..." />
                            <CommandList>
                              <CommandEmpty className="py-3 text-center text-xs text-muted-foreground">No players available</CommandEmpty>
                              <CommandGroup>
                                {!teamIsFull && availableForTeam.map(p => (
                                  <CommandItem
                                    key={p.id}
                                    value={p.name}
                                    onSelect={() => {
                                      onAddToTeam(team.id, p.id)
                                      setTeamPopoverOpen(null)
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <div className="flex w-full items-center justify-between">
                                      <span className="text-sm">{p.name}</span>
                                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${helper.skillPill(p.skill).className}`}>
                                        {helper.skillPill(p.skill).label}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      {/* Rename */}
                      <button
                        onClick={() => { setRenamingTeamId(team.id); setRenameValue(team.name) }}
                        className="flex h-7 w-7 items-center justify-center rounded border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                      >
                        <Pencil size={12} />
                      </button>

                      {/* Delete */}
                      <DeleteButton
                        onConfirm={() => onDeleteTeam(team.id)}
                        loading={deletingTeamId === team.id}
                      />
                    </div>
                  </div>

                  {/* Players list */}
                  {!isCollapsed && (
                    <>
                      {team.players.length === 0 ? (
                        <div className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground/50">
                          No players in this team yet
                        </div>
                      ) : (
                        <div className="border-t border-border p-2">
                          {team.players.map((player, i) => (
                            <div key={player.id}>
                              <div className="group flex items-center justify-between rounded-md px-3 py-2 hover:bg-accent">
                                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                                  <span className="truncate text-[13px] font-medium text-foreground/75">{player.name}</span>
                                  <span className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold ${helper.skillPill(player.skill).className}`}>
                                    {helper.skillPill(player.skill).label}
                                  </span>
                                </div>
                                <button
                                  onClick={() => onRemoveFromTeam(team.id, player.id)}
                                  disabled={removingFromTeam === `${team.id}-${player.id}`}
                                  className="ml-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-muted-foreground/30 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 opacity-100"
                                >
                                  {removingFromTeam === `${team.id}-${player.id}`
                                    ? <Loader2 size={10} className="animate-spin" />
                                    : <X size={11} />}
                                </button>
                              </div>
                              {i < team.players.length - 1 && <Separator className="bg-border/40" />}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </>
  )
}

export default TeamsTab