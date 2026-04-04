import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import playersApi from './services/players'
import helper from './utils/helper'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
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
import { ArrowLeft, Users, Plus, Pencil, Trash2, Loader2, X } from 'lucide-react'

const formatBirthday = (value) => value ? new Date(value).toISOString().slice(0, 10) : ''
const EMPTY_FORM = { name: '', birthday: '', gender: '', rank: '' }
const SKILL_SORT_ORDER = { beginner: 0, intermediate: 1, advanced: 2 }
const GENDER_SORT_ORDER = { Male: 0, M: 0, Female: 1, F: 1 }
const STATIC_SORT_OPTIONS = new Set(['skill_lowest', 'skill_highest', 'birthday_youngest', 'birthday_oldest'])
const OWNER_USERNAME = 'joshiee02'

function PlayersPage({ user }) {
  const navigate = useNavigate()
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
  const derivedSkill = helper.skillFromRank(form.rank)
  const isFormComplete = Boolean(form.name.trim() && form.gender && form.rank && derivedSkill)
  const canManagePlayers = user?.username === OWNER_USERNAME

  const fetchPlayers = async () => {
    try {
      const data = await playersApi.get(user.token)
      if (data?.error) return toast.error(data.error)
      setPlayers(data)
    } catch (error) {
      toast.error(error?.response?.data?.error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPlayers() }, [])

  const openNew = () => { setEditingId(null); setForm(EMPTY_FORM); setFormOpen(true) }
  const openEdit = (player) => {
    setEditingId(player.id)
    setForm({ name: player.name ?? '', birthday: formatBirthday(player.birthday), gender: player.gender ?? '', rank: player.rank ?? '' })
    setFormOpen(true)
  }
  const closeForm = () => { setFormOpen(false); setEditingId(null); setForm(EMPTY_FORM) }
  const handleField = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSortChange = (nextSortBy) => {
    if (STATIC_SORT_OPTIONS.has(nextSortBy)) { setSortBy(nextSortBy); setSortDirection('asc'); return }
    if (sortBy === nextSortBy) { setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc')); return }
    setSortBy(nextSortBy); setSortDirection('asc')
  }

  const handleSubmit = async () => {
    if (!isFormComplete) return toast.warning('Name, gender, and rank are required.')
    const payload = { ...form, name: form.name.trim(), skill: derivedSkill }
    setSubmitting(true)
    try {
      if (editingId) { await playersApi.put(editingId, payload, user.token); toast.success('Player updated.') }
      else { await playersApi.post(payload, user.token); toast.success('Player registered.') }
      closeForm(); fetchPlayers()
    } catch (error) {
      toast.error(error?.response?.data?.error)
    } finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await playersApi.delete(id, user.token)
      setPlayers(prev => prev.filter(p => p.id !== id))
      toast.success('Player deleted.')
    } catch (error) {
      toast.error(error?.response?.data?.error)
    } finally { setDeletingId(null) }
  }

  const filtered = players
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let result = 0
      switch (sortBy) {
        case 'birthday':
        case 'birthday_oldest': result = new Date(a.birthday).getTime() - new Date(b.birthday).getTime(); break
        case 'birthday_youngest': result = new Date(b.birthday).getTime() - new Date(a.birthday).getTime(); break
        case 'skill':
        case 'skill_lowest': result = (SKILL_SORT_ORDER[a.skill] ?? 99) - (SKILL_SORT_ORDER[b.skill] ?? 99); break
        case 'skill_highest': result = (SKILL_SORT_ORDER[b.skill] ?? 99) - (SKILL_SORT_ORDER[a.skill] ?? 99); break
        case 'rank': result = (Number(a.rank) || 0) - (Number(b.rank) || 0); break
        case 'gender': result = (GENDER_SORT_ORDER[a.gender] ?? 99) - (GENDER_SORT_ORDER[b.gender] ?? 99); break
        case 'name': default: result = a.name.localeCompare(b.name); break
      }
      const usesExplicitDirection = ['skill_lowest', 'skill_highest', 'birthday_youngest', 'birthday_oldest'].includes(sortBy)
      return usesExplicitDirection ? result : (sortDirection === 'asc' ? result : -result)
    })

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background font-sans text-foreground">
      <Toaster position="top-right" richColors />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 border-b border-border px-4 py-3 md:px-8 md:py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={15} />
            Dashboard
          </button>
          <div className="flex items-center gap-2">
            <Users size={15} className="text-muted-foreground" />
            <h1 className="text-[14px] font-semibold tracking-tight">Players</h1>
          </div>
          <Button size="sm" onClick={openNew} className="bg-emerald-600 text-white hover:bg-emerald-500">
            <Plus size={13} className="mr-1.5" />
            New Player
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="mx-auto w-full max-w-4xl flex-1 overflow-hidden px-4 py-4 md:px-8 md:py-6 flex flex-col gap-4">

          {/* ── Register / Edit form ──────────────────────────────────── */}
          {formOpen && (
            <div className="flex-shrink-0 rounded-xl border border-border bg-card p-4 md:p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {editingId ? 'Edit Player' : 'Register New Player'}
                </p>
                <button
                  onClick={closeForm}
                  className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
                >
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
                  <Select value={form.gender} onValueChange={(value) => handleField('gender', value)}>
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

          {/* ── Search ───────────────────────────────────────────────── */}
          <div className="flex-shrink-0">
            <Input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search players..."
              className="w-full border-input bg-background placeholder:text-muted-foreground/50 focus-visible:ring-0"
            />
          </div>

          {/* ── Player list ──────────────────────────────────────────── */}
          <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-border bg-card overflow-hidden">

            {/* Table head — desktop */}
            <div className="hidden flex-shrink-0 grid-cols-14 gap-3 border-b border-border px-4 py-2.5 md:grid">
              {[
                { key: 'name',     label: 'Name',     span: 'col-span-4' },
                { key: 'skill',    label: 'Skill',    span: 'col-span-2' },
                { key: 'birthday', label: 'Birthday', span: 'col-span-3' },
                { key: 'rank',     label: 'Rank',     span: 'col-span-2' },
                { key: 'gender',   label: 'Gender',   span: 'col-span-2' },
              ].map(({ key, label, span }) => (
                <div key={key} className={`${span} flex items-center`}>
                  <button
                    type="button"
                    onClick={() => handleSortChange(key)}
                    className={`text-[10px] font-semibold uppercase tracking-widest transition-colors ${
                      sortBy === key ? 'text-foreground/70' : 'text-muted-foreground hover:text-foreground/55'
                    }`}
                  >
                    {label}
                    {sortBy === key && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                  </button>
                </div>
              ))}
              <div className="col-span-1" />
            </div>

            {/* Sort — mobile */}
            <div className="flex flex-shrink-0 items-center justify-between border-b border-border px-3 py-2 md:hidden">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Sort Players</span>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="h-7 w-32 border-input bg-background px-2 text-[9px] font-semibold uppercase tracking-widest text-foreground/60">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent position="popper" align="end">
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="gender">Gender</SelectItem>
                  <SelectItem value="skill_lowest">Skill: Lowest</SelectItem>
                  <SelectItem value="skill_highest">Skill: Highest</SelectItem>
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
                        <span className="col-span-2 pl-3 text-[12px] text-muted-foreground">{player.rank ?? '—'}</span>
                        <span className="col-span-2 pl-2 text-[12px] text-muted-foreground">{player.gender ?? '—'}</span>
                        <div className="col-span-1 flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(player)}
                            disabled={!canManagePlayers}
                            title={canManagePlayers ? 'Edit player' : 'Only joshiee02 can edit players'}
                            className="flex h-7 w-7 items-center justify-center rounded border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Pencil size={12} />
                          </button>
                          <DeleteButton
                            onConfirm={() => handleDelete(player.id)}
                            loading={deletingId === player.id}
                            disabled={!canManagePlayers}
                          />
                        </div>
                      </div>

                      {/* Mobile row */}
                      <div className="flex items-center justify-between rounded-md px-3 py-3 transition-colors hover:bg-accent md:hidden">
                        <div className="flex min-w-0 flex-col gap-1">
                          <span className="truncate text-[13px] font-medium text-foreground/75">{player.name}</span>
                          <span className="text-[11px] text-muted-foreground">
                            {helper.capitalize(player.skill) ?? '—'} · {formatBirthday(player.birthday) || '—'} · {player.gender}
                          </span>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-1.5 ml-3">
                          <button
                            onClick={() => openEdit(player)}
                            disabled={!canManagePlayers}
                            title={canManagePlayers ? 'Edit player' : 'Only joshiee02 can edit players'}
                            className="flex h-8 w-8 items-center justify-center rounded border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Pencil size={13} />
                          </button>
                          <DeleteButton
                            onConfirm={() => handleDelete(player.id)}
                            loading={deletingId === player.id}
                            disabled={!canManagePlayers}
                          />
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
          title={disabled ? 'Only joshiee02 can delete players' : 'Delete player'}
          className="flex h-7 w-7 items-center justify-center rounded border border-red-500/20 bg-red-500/[0.06] text-red-400/60 hover:bg-red-500/[0.12] hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30 md:h-7 md:w-7 h-8 w-8"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this player?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove the player from the database. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-500">
            Delete Player
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default PlayersPage