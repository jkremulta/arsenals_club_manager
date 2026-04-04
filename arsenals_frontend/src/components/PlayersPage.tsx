import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import playersApi from '../services/players'
import helper from '../utils/helper'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Users,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
} from 'lucide-react'

const SKILLS = ['beginner', 'intermediate', 'advanced']
const formatBirthday = (value) => value ? new Date(value).toISOString().slice(0, 10) : ''

const EMPTY_FORM = { name: '', birthday: '', gender: '', rank: '', skill: '' }

function PlayersPage({ user }) {
  const navigate = useNavigate()

  const [players, setPlayers]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [formOpen, setFormOpen]     = useState(false)
  const [editingId, setEditingId]   = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  // ── Fetch ────────────────────────────────────────────────────────────
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

  // ── Form ─────────────────────────────────────────────────────────────
  const openNew = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormOpen(true)
  }

  const openEdit = (player) => {
    setEditingId(player.id)
    setForm({
      name:   player.name   ?? '',
      birthday: formatBirthday(player.birthday),
      gender: player.gender ?? '',
      rank:   player.rank   ?? '',
      skill:  player.skill  ?? '',
    })
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const handleField = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.skill) return toast.warning('Name and skill are required.')
    setSubmitting(true)
    try {
      if (editingId) {
        await playersApi.put(editingId, form, user.token)
        toast.success('Player updated.')
      } else {
        await playersApi.post(form, user.token)
        toast.success('Player registered.')
      }
      closeForm()
      fetchPlayers()
    } catch (error) {
      toast.error(error?.response?.data?.error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await playersApi.delete(id, user.token)
      setPlayers(prev => prev.filter(p => p.id !== id))
      toast.success('Player deleted.')
    } catch (error) {
      toast.error(error?.response?.data?.error)
    } finally {
      setDeletingId(null)
    }
  }

  // ── Filtered list ────────────────────────────────────────────────────
  const filtered = players.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0a0a0a] font-sans text-white">
      <Toaster theme="dark" position="top-right" richColors />

      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 border-b border-white/[0.06] px-4 py-3 md:px-8 md:py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[13px] text-white/45 transition-colors hover:text-white/80"
          >
            <ArrowLeft size={15} />
            Dashboard
          </button>

          <div className="flex items-center gap-2">
            <Users size={15} className="text-white/40" />
            <h1 className="text-[14px] font-semibold tracking-tight">Players</h1>
          </div>

          <Button
            size="sm"
            onClick={openNew}
            className="bg-emerald-600 text-white hover:bg-emerald-500"
          >
            <Plus size={13} className="mr-1.5" />
            New Player
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="mx-auto w-full max-w-4xl flex-1 overflow-hidden px-4 py-4 md:px-8 md:py-6 flex flex-col gap-4">

          {/* ── Register / Edit form ─────────────────────────────────── */}
          {formOpen && (
            <div className="flex-shrink-0 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 md:p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/55">
                  {editingId ? 'Edit Player' : 'Register New Player'}
                </p>
                <button
                  onClick={closeForm}
                  className="flex h-6 w-6 items-center justify-center rounded text-white/30 hover:bg-white/[0.06] hover:text-white/60"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  { key: 'name',   label: 'Name',   placeholder: 'Juan dela Cruz', type: 'text',   span: 'col-span-2 md:col-span-2' },
                  { key: 'birthday', label: 'Birthday', placeholder: '',            type: 'date',   span: '' },
                  { key: 'rank',   label: 'Rank',   placeholder: '5',              type: 'number', span: '' },
                ].map(({ key, label, placeholder, type, span }) => (
                  <div key={key} className={`flex flex-col gap-1.5 ${span}`}>
                    <label className="text-[10px] font-medium text-white/45">{label}</label>
                    <Input
                      type={type}
                      value={form[key]}
                      onChange={e => handleField(key, e.target.value)}
                      placeholder={placeholder}
                      min={key === 'rank' ? '0.5' : undefined}
                      max={key === 'rank' ? '10' : undefined}
                      step={key === 'rank' ? '0.5' : undefined}
                      className="w-full border-white/10 bg-white/5 text-white placeholder:text-white/20 focus-visible:border-emerald-500/40 focus-visible:ring-0"
                    />
                  </div>
                ))}

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-medium text-white/45">Gender</label>
                  <Select value={form.gender} onValueChange={(value) => handleField('gender', value)}>
                    <SelectTrigger className="w-full border-white/10 bg-white/5 text-white">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-[#111] text-white">
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-1.5">
                <label className="text-[10px] font-medium text-white/45">Skill</label>
                <div className="grid grid-cols-3 gap-2">
                  {SKILLS.map(s => (
                    <button
                      key={s}
                      onClick={() => handleField('skill', s)}
                      className={`rounded-lg border py-2 text-[12px] font-medium capitalize transition-all ${
                        form.skill === s
                          ? 'border-emerald-500/35 bg-emerald-500/15 text-emerald-400'
                          : 'border-white/10 bg-white/[0.04] text-white/40 hover:bg-white/[0.07] hover:text-white/60'
                      }`}
                    >
                      {helper.capitalize(s)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={closeForm}
                  className="border-white/10 bg-transparent text-white/50 hover:bg-white/5 hover:text-white/70"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={submitting || !form.name.trim() || !form.skill}
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
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search players..."
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/20"
            />
          </div>

          {/* ── Player list ──────────────────────────────────────────── */}
          <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            {/* Table head — desktop only */}
            <div className="hidden flex-shrink-0 grid-cols-12 gap-3 border-b border-white/[0.05] px-4 py-2.5 md:grid">
              <span className="col-span-4 text-[10px] font-semibold uppercase tracking-widest text-white/35">Name</span>
              <span className="col-span-2 text-[10px] font-semibold uppercase tracking-widest text-white/35">Skill</span>
              <span className="col-span-2 text-[10px] font-semibold uppercase tracking-widest text-white/35">Birthday</span>
              <span className="col-span-2 text-[10px] font-semibold uppercase tracking-widest text-white/35">Rank</span>
              <span className="col-span-2 text-[10px] font-semibold uppercase tracking-widest text-white/35 text-right">Actions</span>
            </div>

            <ScrollArea className="flex-1 min-h-0">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={20} className="animate-spin text-white/20" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <Users size={24} className="mb-2 text-white/10" />
                  <p className="text-sm text-white/30">{search ? 'No players match your search' : 'No players yet'}</p>
                </div>
              ) : (
                <div className="p-2">
                  {filtered.map((player, i) => (
                    <div key={player.id}>
                      {/* Desktop row */}
                      <div className="group hidden items-center rounded-md px-3 py-2.5 transition-colors hover:bg-white/[0.04] md:grid md:grid-cols-12 md:gap-3">
                        <span className="col-span-4 truncate text-[13px] font-medium text-white/75">{player.name}</span>
                        <span className="col-span-2">
                          <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${helper.skillPill(player.skill).className}`}>
                            {helper.skillPill(player.skill).label}
                          </span>
                        </span>
                        <span className="col-span-2 text-[12px] text-white/40">{formatBirthday(player.birthday) || '—'}</span>
                        <span className="col-span-2 text-[12px] text-white/40">{player.rank ?? '—'}</span>
                        <div className="col-span-2 flex items-center justify-end gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => openEdit(player)}
                            className="flex h-7 w-7 items-center justify-center rounded border border-white/[0.08] bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/70"
                          >
                            <Pencil size={12} />
                          </button>
                          <DeleteButton
                            onConfirm={() => handleDelete(player.id)}
                            loading={deletingId === player.id}
                          />
                        </div>
                      </div>

                      {/* Mobile row */}
                      <div className="flex items-center justify-between rounded-md px-3 py-3 transition-colors hover:bg-white/[0.04] md:hidden">
                        <div className="flex min-w-0 flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-[13px] font-medium text-white/75">{player.name}</span>
                            <span className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold ${helper.skillPill(player.skill).className}`}>
                              {helper.skillPill(player.skill).label}
                            </span>
                          </div>
                          <span className="text-[11px] text-white/30">
                            Birthday {formatBirthday(player.birthday) || '—'} · Rank {player.rank ?? '—'}
                          </span>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-1.5 ml-3">
                          <button
                            onClick={() => openEdit(player)}
                            className="flex h-8 w-8 items-center justify-center rounded border border-white/[0.08] bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/70"
                          >
                            <Pencil size={13} />
                          </button>
                          <DeleteButton
                            onConfirm={() => handleDelete(player.id)}
                            loading={deletingId === player.id}
                          />
                        </div>
                      </div>

                      {i < filtered.length - 1 && (
                        <Separator className="bg-white/[0.04]" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Footer count */}
            {!loading && (
              <div className="flex-shrink-0 border-t border-white/[0.05] px-4 py-2.5">
                <p className="text-[11px] text-white/25">
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

// ── Delete confirm button ─────────────────────────────────────────────────
function DeleteButton({ onConfirm, loading }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          disabled={loading}
          className="flex h-7 w-7 items-center justify-center rounded border border-red-500/20 bg-red-500/[0.06] text-red-400/60 hover:bg-red-500/[0.12] hover:text-red-400 md:h-7 md:w-7 h-8 w-8"
        >
          {loading
            ? <Loader2 size={12} className="animate-spin" />
            : <Trash2 size={12} />}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border-white/10 bg-[#111] text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this player?</AlertDialogTitle>
          <AlertDialogDescription className="text-white/50">
            This will permanently remove the player from the database. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-white/10 bg-transparent text-white/60 hover:bg-white/5">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-500">
            Delete Player
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default PlayersPage
