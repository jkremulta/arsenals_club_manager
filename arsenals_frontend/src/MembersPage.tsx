import { useState, useEffect } from 'react'

import attendanceApi from './services/attendance'
import playersApi from './services/players'
import teamsApi from './services/team'
import helper from './utils/helper'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command'
import { Users, Plus, Pencil, Trash2, Loader2, X, Shield, UserPlus, ChevronDown } from 'lucide-react'

import Header from './components/membersPage/Header'
import Tabs from './components/membersPage/Tabs'

const formatBirthday = (value) => value ? new Date(value).toISOString().slice(0, 10) : ''
const EMPTY_FORM = { name: '', birthday: '', gender: '', rank: '' }
const SKILL_SORT_ORDER = { beginner: 0, intermediate: 1, advanced: 2 }
const GENDER_SORT_ORDER = { Male: 0, M: 0, Female: 1, F: 1 }
const STATIC_SORT_OPTIONS = new Set(['skill_lowest', 'skill_highest', 'birthday_youngest', 'birthday_oldest', 'rank_lowest', 'rank_highest'])
const OWNER_USERNAME = 'joshiee02'

function PlayersPage({ user }) {

  const [activeTab, setActiveTab] = useState('players')

  // ── Players state ─────────────────────────────────────────────────
  const [players, setPlayers]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [sortDirection, setSortDirection] = useState('asc')
  const [formOpen, setFormOpen]     = useState(false)
  const [editingId, setEditingId]   = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [sortBy, setSortBy]         = useState('name')
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  // ── Teams state ───────────────────────────────────────────────────
  const [teams, setTeams]                   = useState([])
  const [teamsLoading, setTeamsLoading]     = useState(true)
  const [attendance, setAttendance]         = useState([])
  const [newTeamName, setNewTeamName]       = useState('')
  const [creatingTeam, setCreatingTeam]     = useState(false)
  const [deletingTeamId, setDeletingTeamId] = useState(null)
  const [addingToTeam, setAddingToTeam]     = useState(null)
  const [removingFromTeam, setRemovingFromTeam] = useState(null)
  const [teamPopoverOpen, setTeamPopoverOpen] = useState(null)
  const [renamingTeamId, setRenamingTeamId] = useState(null)
  const [renameValue, setRenameValue]       = useState('')
  const [renamingLoading, setRenamingLoading] = useState(null)
  const [collapsedTeams, setCollapsedTeams] = useState(new Set())

  const derivedSkill = helper.skillFromRank(form.rank)
  const isFormComplete = Boolean(form.name.trim() && form.gender && form.rank && derivedSkill)
  const canManagePlayers = user?.username === OWNER_USERNAME

  const toggleTeamCollapse = (id) => {
    setCollapsedTeams(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // ── Fetch ─────────────────────────────────────────────────────────
  const fetchPlayers = async () => {
    try {
      const data = await playersApi.get(user.token)
      if (data?.error) return toast.error(data.error, { duration: 2000 })
      setPlayers(data)
    } catch (error) {
      toast.error(error?.response?.data?.error, { duration: 2000 })
    } finally {
      setLoading(false)
    }
  }

  const fetchTeams = async () => {
    try {
      const data = await teamsApi.get(user.token)
      setTeams(data)
      setCollapsedTeams(new Set(data.map(team => team.id)))
    } catch (error) {
      toast.error(error?.response?.data?.error, { duration: 2000 })
    } finally {
      setTeamsLoading(false)
    }
  }

  const fetchAttendance = async () => {
    try {
      const data = await attendanceApi.get(user.token)
      setAttendance(data)
    } catch (error) {
      toast.error(error?.response?.data?.error, { duration: 2000 })
    }
  }

  useEffect(() => {
    fetchPlayers()
    fetchTeams()
    fetchAttendance()
  }, [])

  // ── Player handlers ───────────────────────────────────────────────
  const openNew   = () => { setEditingId(null); setForm(EMPTY_FORM); setFormOpen(true) }
  const openEdit  = (player) => {
    setEditingId(player.id)
    setForm({ name: player.name ?? '', birthday: formatBirthday(player.birthday), gender: player.gender ?? '', rank: player.rank ?? '' })
    setFormOpen(true)
  }
  const closeForm = () => { setFormOpen(false); setEditingId(null); setForm(EMPTY_FORM) }
  const handleField = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSortChange = (nextSortBy) => {
    if (STATIC_SORT_OPTIONS.has(nextSortBy)) { setSortBy(nextSortBy); setSortDirection('asc'); return }
    if (sortBy === nextSortBy) { setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc'); return }
    setSortBy(nextSortBy); setSortDirection('asc')
  }

  const handleSubmit = async () => {
    if (!isFormComplete) return toast.warning('Name, gender, and rank are required.', { duration: 2000 })
    const payload = { ...form, name: form.name.trim(), skill: derivedSkill }
    setSubmitting(true)
    try {
      if (editingId) { await playersApi.put(editingId, payload, user.token); toast.success('Player updated.', { duration: 2000 }) }
      else { await playersApi.post(payload, user.token); toast.success('Player registered.') }
      closeForm(); fetchPlayers()
    } catch (error) {
      toast.error(error?.response?.data?.error, { duration: 2000 })
    } finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await playersApi.delete(id, user.token)
      setPlayers(prev => prev.filter(p => p.id !== id))
      toast.success('Player deleted.', { duration: 2000 })
    } catch (error) {
      toast.error(error?.response?.data?.error, { duration: 2000 })
    } finally { setDeletingId(null) }
  }

  // ── Team handlers ─────────────────────────────────────────────────
  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return
    setCreatingTeam(true)
    try {
      await teamsApi.create(newTeamName.trim(), user.token)
      setNewTeamName('')
      toast.success('Team created.', { duration: 2000 })
      fetchTeams()
    } catch (error) {
      toast.error(error?.response?.data?.error, { duration: 2000 })
    } finally { setCreatingTeam(false) }
  }

  const handleDeleteTeam = async (id) => {
    setDeletingTeamId(id)
    try {
      await teamsApi.remove(id, user.token)
      setTeams(prev => prev.filter(t => t.id !== id))
      toast.success('Team deleted.', { duration: 2000 })
    } catch (error) {
      toast.error(error?.response?.data?.error, { duration: 2000 })
    } finally { setDeletingTeamId(null) }
  }

  const handleAddToTeam = async (teamId, playerId) => {
    setAddingToTeam(teamId)
    setTeamPopoverOpen(null)
    try {
      const updated = await teamsApi.addPlayer(teamId, playerId, user.token)
      setTeams(prev => prev.map(t => t.id === teamId ? updated : t))
      toast.success('Player added to team.', { duration: 2000 })
    } catch (error) {
      toast.error(error?.response?.data?.error, { duration: 2000 })
    } finally { setAddingToTeam(null) }
  }

  const handleRemoveFromTeam = async (teamId, playerId) => {
    setRemovingFromTeam(`${teamId}-${playerId}`)
    try {
      const updated = await teamsApi.removePlayer(teamId, playerId, user.token)
      setTeams(prev => prev.map(t => t.id === teamId ? updated : t))
      toast.success('Player removed from team.', { duration: 2000 })
    } catch (error) {
      toast.error(error?.response?.data?.error, { duration: 2000 })
    } finally { setRemovingFromTeam(null) }
  }

  const handleRenameTeam = async (id) => {
    if (!renameValue.trim()) return
    setRenamingLoading(id)
    try {
      const updated = await teamsApi.rename(id, renameValue.trim(), user.token)
      setTeams(prev => prev.map(t => t.id === id ? updated : t))
      setRenamingTeamId(null)
      setRenameValue('')
      toast.success('Team renamed.', { duration: 2000 })
    } catch (error) {
      toast.error(error?.response?.data?.error, { duration: 2000 })
    } finally {
      setRenamingLoading(null)
    }
  }

  // ── Sorted/filtered players ───────────────────────────────────────
  const filtered = players
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let result = 0
      switch (sortBy) {
        case 'birthday':
        case 'birthday_oldest':   result = new Date(a.birthday).getTime() - new Date(b.birthday).getTime(); break
        case 'birthday_youngest': result = new Date(b.birthday).getTime() - new Date(a.birthday).getTime(); break
        case 'skill':
        case 'skill_lowest':      result = (SKILL_SORT_ORDER[a.skill] ?? 99) - (SKILL_SORT_ORDER[b.skill] ?? 99); break
        case 'skill_highest':     result = (SKILL_SORT_ORDER[b.skill] ?? 99) - (SKILL_SORT_ORDER[a.skill] ?? 99); break
        case 'rank':
        case 'rank_lowest':       result = (Number(a.rank) || 0) - (Number(b.rank) || 0); break
        case 'rank_highest':      result = (Number(b.rank) || 0) - (Number(a.rank) || 0); break
        case 'gender':            result = (GENDER_SORT_ORDER[a.gender] ?? 99) - (GENDER_SORT_ORDER[b.gender] ?? 99); break
        case 'name': default:     result = a.name.localeCompare(b.name); break
      }
      return STATIC_SORT_OPTIONS.has(sortBy) ? result : (sortDirection === 'asc' ? result : -result)
    })

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background font-sans text-foreground">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <Header/>

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <Tabs setActiveTab={setActiveTab} activeTab={activeTab}/>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="mx-auto w-full max-w-4xl flex-1 overflow-hidden px-4 py-4 md:px-8 md:py-6 flex flex-col gap-4">

          {/* ══════════════════════════════════════════════════════════
              PLAYERS TAB
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'players' && (
            <>
              {/* Register / Edit form */}
              {formOpen && (
                <div className="flex-shrink-0 rounded-xl border border-border bg-card p-4 md:p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {editingId ? 'Edit Player' : 'Register New Player'}
                    </p>
                    <button onClick={closeForm} className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {[
                      { key: 'name',     label: 'Name',     placeholder: 'Juan dela Cruz', type: 'text',   span: 'col-span-2 md:col-span-2' },
                      { key: 'birthday', label: 'Birthday', placeholder: '',               type: 'date',   span: '' },
                      { key: 'rank',     label: 'Rank',     placeholder: '5',              type: 'number', span: '' },
                    ].map(({ key, label, placeholder, type, span }) => (
                      <div key={key} className={`flex flex-col gap-1.5 ${span}`}>
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-medium text-muted-foreground">{label}</label>
                          {key === 'rank' && (
                            <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${helper.skillPill(derivedSkill).className}`}>
                              {derivedSkill ? helper.capitalize(derivedSkill) : '—'}
                            </span>
                          )}
                        </div>
                        <Input
                          type={type}
                          value={form[key]}
                          onChange={e => handleField(key, e.target.value)}
                          placeholder={placeholder}
                          min={key === 'rank' ? '0.5' : undefined}
                          max={key === 'rank' ? '10' : undefined}
                          step={key === 'rank' ? '0.5' : undefined}
                          className="w-full border-input bg-background placeholder:text-muted-foreground/50 focus-visible:border-emerald-500/40 focus-visible:ring-0"
                        />
                      </div>
                    ))}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-medium text-muted-foreground">Gender</label>
                      <Select value={form.gender} onValueChange={v => handleField('gender', v)}>
                        <SelectTrigger className="w-full border-input bg-background">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={closeForm}>Cancel</Button>
                    <Button
                      size="sm"
                      onClick={handleSubmit}
                      disabled={submitting || !isFormComplete}
                      className="bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40"
                    >
                      {submitting && <Loader2 size={13} className="mr-1.5 animate-spin" />}
                      {editingId ? 'Save Changes' : 'Register Player'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Search */}
              <div className="flex-shrink-0 flex gap-2">
                <Input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search players..."
                  className="w-full border-input bg-background text-sm bg-card placeholder:text-sm placeholder:text-muted-foreground/50 md:text-base md:placeholder:text-base focus-visible:ring-0"
                />
                <Button size='sm' onClick={openNew} className="bg-emerald-600 text-white hover:bg-emerald-500">
                  <Plus size={13} className="mr-1.5" />
                  New Player
                </Button>
              </div>

              {/* Player list */}
              <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-border bg-card overflow-hidden">
                {/* Desktop table head */}
                <div className="hidden flex-shrink-0 grid-cols-14 gap-3 border-b border-border px-4 py-2.5 md:grid">
                  {[
                    { key: 'name',     label: 'Name',     span: 'col-span-4' },
                    { key: 'skill',    label: 'Skill',    span: 'col-span-2' },
                    { key: 'birthday', label: 'Birthday', span: 'col-span-3' },
                    ...(canManagePlayers ? [{ key: 'rank', label: 'Rank', span: 'col-span-1 flex justify-center' }] : []),
                    { key: 'gender',   label: 'Gender',   span: canManagePlayers ? 'col-span-3 pl-8' : 'col-span-4' },
                  ].map(({ key, label, span }) => (
                    <div key={key} className={`${span} flex items-center`}>
                      <button
                        type="button"
                        onClick={() => handleSortChange(key)}
                        className={`text-[10px] font-semibold uppercase tracking-widest transition-colors ${
                          sortBy === key ? 'text-foreground/70' : 'text-muted-foreground hover:text-foreground/55'
                        }`}
                      >
                        {label}{sortBy === key && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                      </button>
                    </div>
                  ))}
                  <div className="col-span-1" />
                </div>

                {/* Mobile sort */}
                <div className="flex flex-shrink-0 items-center justify-between border-b border-border px-3 py-2 md:hidden">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Sort</span>
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="h-7 w-32 border-input bg-background px-2 text-[9px] font-semibold uppercase tracking-widest text-foreground/60">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent position="popper" align="end">
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="gender">Gender</SelectItem>
                      <SelectItem value="skill_lowest">Skill: Lowest</SelectItem>
                      <SelectItem value="skill_highest">Skill: Highest</SelectItem>
                      {canManagePlayers && <>
                        <SelectItem value="rank_lowest">Rank: Lowest</SelectItem>
                        <SelectItem value="rank_highest">Rank: Highest</SelectItem>
                      </>}
                      <SelectItem value="birthday_youngest">Age: Youngest</SelectItem>
                      <SelectItem value="birthday_oldest">Age: Oldest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <ScrollArea className="flex-1 min-h-0">
                  {loading ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 size={20} className="animate-spin text-muted-foreground/40" />
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center py-16 text-center">
                      <Users size={24} className="mb-2 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">{search ? 'No players match your search' : 'No players yet'}</p>
                    </div>
                  ) : (
                    <div className="p-2">
                      {filtered.map((player, i) => (
                        <div key={player.id}>
                          {/* Desktop row */}
                          <div className="group hidden items-center rounded-md px-3 py-2.5 transition-colors hover:bg-accent md:grid md:grid-cols-14 md:gap-3">
                            <span className="col-span-4 truncate text-[13px] font-medium text-foreground/75">{player.name}</span>
                            <span className="col-span-2 text-[12px] text-muted-foreground">{helper.capitalize(player.skill)}</span>
                            <span className="col-span-3 text-[12px] text-muted-foreground">{formatBirthday(player.birthday) || '—'}</span>
                            {canManagePlayers && <span className="col-span-1 flex justify-center text-[12px] text-muted-foreground">{player.rank ?? '—'}</span>}
                            <span className={`text-[12px] text-muted-foreground ${canManagePlayers ? 'col-span-3 pl-10' : 'col-span-4 pl-2'}`}>{player.gender ?? '—'}</span>
                            <div className="col-span-1 flex items-center justify-end gap-1.5">
                              <button onClick={() => openEdit(player)} disabled={!canManagePlayers} className="flex h-7 w-7 items-center justify-center rounded border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30">
                                <Pencil size={12} />
                              </button>
                              <DeleteButton onConfirm={() => handleDelete(player.id)} loading={deletingId === player.id} disabled={!canManagePlayers} />
                            </div>
                          </div>
                          {/* Mobile row */}
                          <div className="flex items-center justify-between rounded-md px-3 py-3 transition-colors hover:bg-accent md:hidden">
                            <div className="flex min-w-0 flex-col gap-1">
                              <span className="truncate text-[13px] font-medium text-foreground/75">{player.name}</span>
                              <span className="text-[11px] text-muted-foreground">
                                {helper.capitalize(player.skill) ?? '—'}{canManagePlayers && ` ${player.rank}`} · {formatBirthday(player.birthday) || '—'} · {player.gender}
                              </span>
                            </div>
                            <div className="flex flex-shrink-0 items-center gap-1.5 ml-3">
                              <button onClick={() => openEdit(player)} disabled={!canManagePlayers} className="flex h-8 w-8 items-center justify-center rounded border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30">
                                <Pencil size={13} />
                              </button>
                              <DeleteButton onConfirm={() => handleDelete(player.id)} loading={deletingId === player.id} disabled={!canManagePlayers} />
                            </div>
                          </div>
                          {i < filtered.length - 1 && <Separator className="bg-border/60" />}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {!loading && (
                  <div className="flex-shrink-0 border-t border-border px-4 py-2.5">
                    <p className="text-[11px] text-muted-foreground/60">
                      {filtered.length} {filtered.length === 1 ? 'player' : 'players'}
                      {search && ` matching "${search}"`}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════════════
              TEAMS TAB
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'teams' && (
            <>
              {/* Create team */}
              <div className="flex-shrink-0 flex gap-2">
                <Input
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreateTeam()}
                  placeholder="New team name..."
                  className="flex-1 border-input bg-card text-sm placeholder:text-sm placeholder:text-muted-foreground/50 md:text-base md:placeholder:text-base focus-visible:ring-0"
                />
                <Button size='sm'
                  onClick={handleCreateTeam}
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
                      const allTeamPlayerIds = new Set(teams.flatMap(currentTeam => currentTeam.players.map(player => player.id)))
                      const availableForTeam = attendance
                        .filter(player => !allTeamPlayerIds.has(player.id))
                        .sort((a, b) => a.name.localeCompare(b.name))
                      const teamIsFull = team.players.length >= 7

                      return (
                        <div key={team.id} className="rounded-xl border border-border bg-card overflow-hidden">
                          {/* Team header */}
                          <div
                            className="flex items-center justify-between px-4 py-3 cursor-pointer select-none transition-colors hover:bg-accent/50"
                            onClick={() => toggleTeamCollapse(team.id)}
                          >
                            {renamingTeamId === team.id ? (
                              <div className="flex flex-1 items-center gap-2 mr-2" onClick={e => e.stopPropagation()}>
                                <Input
                                  value={renameValue}
                                  onChange={e => setRenameValue(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') handleRenameTeam(team.id)
                                    if (e.key === 'Escape') { setRenamingTeamId(null); setRenameValue('') }
                                  }}
                                  autoFocus
                                  className="h-7 border-input bg-background text-sm focus-visible:ring-0"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleRenameTeam(team.id)}
                                  disabled={renamingLoading === team.id}
                                  className="h-7 bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40"
                                >
                                  {renamingLoading === team.id && (
                                    <Loader2 size={12} className="mr-1 animate-spin" />
                                  )}
                                  Save
                                </Button>
                                <button onClick={() => { setRenamingTeamId(null); setRenameValue('') }} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>
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
                              {/* Add player to team */}
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
                                            onSelect={() => handleAddToTeam(team.id, p.id)}
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

                              {/* Delete team */}
                              <DeleteButton
                                onConfirm={() => handleDeleteTeam(team.id)}
                                loading={deletingTeamId === team.id}
                              />
                            </div>
                          </div>

                          {/* Team players — hidden when collapsed */}
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
                                          onClick={() => handleRemoveFromTeam(team.id, player.id)}
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
          )}

        </div>
      </div>
    </div>
  )
}

function DeleteButton({ onConfirm, loading, disabled = false }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          disabled={loading || disabled}
          className="flex h-7 w-7 items-center justify-center rounded border border-red-500/20 bg-red-500/[0.06] text-red-400/60 hover:bg-red-500/[0.12] hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-500">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default PlayersPage