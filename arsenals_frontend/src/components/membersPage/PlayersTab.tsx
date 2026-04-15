import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Users, Plus, Pencil, Loader2, X } from 'lucide-react'
import helper from '@/utils/helper'
import DeleteButton from './DeleteButton'

const formatBirthday = (value) => value ? new Date(value).toISOString().slice(0, 10) : ''
const STATIC_SORT_OPTIONS = new Set(['skill_lowest', 'skill_highest', 'birthday_youngest', 'birthday_oldest', 'rank_lowest', 'rank_highest'])
const SKILL_SORT_ORDER = { beginner: 0, intermediate: 1, advanced: 2 }
const GENDER_SORT_ORDER = { Male: 0, M: 0, Female: 1, F: 1 }

function PlayersTab({
  players, loading,
  search, setSearch,
  sortBy, setSortBy,
  sortDirection, setSortDirection,
  formOpen,
  editingId,
  form, setForm,
  submitting,
  deletingId,
  canManagePlayers,
  onSubmit,
  onDelete,
  onOpenNew,
  onOpenEdit,
  onCloseForm,
}) {
  const derivedSkill = helper.skillFromRank(form.rank)
  const isFormComplete = Boolean(form.name.trim() && form.gender && form.rank && derivedSkill)

  const handleField = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSortChange = (nextSortBy) => {
    if (STATIC_SORT_OPTIONS.has(nextSortBy)) { setSortBy(nextSortBy); setSortDirection('asc'); return }
    if (sortBy === nextSortBy) { setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc'); return }
    setSortBy(nextSortBy); setSortDirection('asc')
  }

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
    <>
      {/* Register / Edit form */}
      {formOpen && (
        <div className="flex-shrink-0 rounded-xl border border-border bg-card p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {editingId ? 'Edit Player' : 'Register New Player'}
            </p>
            <button onClick={onCloseForm} className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground">
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
                  className="w-full border-input bg-card placeholder:text-muted-foreground/50 focus-visible:border-emerald-500/40 focus-visible:ring-0"
                />
              </div>
            ))}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-medium text-muted-foreground">Gender</label>
              <Select value={form.gender} onValueChange={v => handleField('gender', v)}>
                <SelectTrigger className="w-full border-input bg-card">
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
            <Button variant="outline" size="sm" onClick={onCloseForm}>Cancel</Button>
            <Button
              size="sm"
              onClick={onSubmit}
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
        <Button size='sm' onClick={onOpenNew} className="bg-emerald-600 text-white hover:bg-emerald-500">
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
                      <button onClick={() => onOpenEdit(player)} disabled={!canManagePlayers} className="flex h-7 w-7 items-center justify-center rounded border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30">
                        <Pencil size={12} />
                      </button>
                      <DeleteButton onConfirm={() => onDelete(player.id)} loading={deletingId === player.id} disabled={!canManagePlayers} />
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
                      <button onClick={() => onOpenEdit(player)} disabled={!canManagePlayers} className="flex h-8 w-8 items-center justify-center rounded border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30">
                        <Pencil size={13} />
                      </button>
                      <DeleteButton onConfirm={() => onDelete(player.id)} loading={deletingId === player.id} disabled={!canManagePlayers} />
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
  )
}

export default PlayersTab