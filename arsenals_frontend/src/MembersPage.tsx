import { useState } from 'react'

import Header from './components/members/Header'
import Tabs from './components/members/Tabs'
import PlayersTab from './components/members/PlayersTab'

import { useMembers } from './hooks/useMembers'
import { useUIStore } from '@/stores/useUIStore'

const formatBirthday = (value) => value ? new Date(value).toISOString().slice(0, 10) : ''
const EMPTY_FORM = { name: '', birthday: '', gender: '', rank: '' }
const OWNER_USERNAME = 'joshiee02'

function MembersPage({ user }) {

  const { activeTab, setActiveTab } = useUIStore()

  const { players, loading, handleSubmit, handleDelete, createPlayerMutation, updatePlayerMutation, deletePlayerMutation } = useMembers(user.token)

  // ── Local transient UI state ───────────────────────────────────────
  const [search, setSearch]             = useState('')
  const [sortBy, setSortBy]             = useState('recent')
  const [sortDirection, setSortDirection] = useState('desc')
  const [formOpen, setFormOpen]         = useState(false)
  const [editingId, setEditingId]       = useState(null)
  const [form, setForm]                 = useState(EMPTY_FORM)

  const canManagePlayers = user?.username === OWNER_USERNAME

  const submitting = createPlayerMutation.isPending || updatePlayerMutation.isPending
  const deletingId = deletePlayerMutation.isPending ? deletePlayerMutation.variables : null

  // ── Form handlers ─────────────────────────────────────────────────
  const openNew  = () => { setEditingId(null); setForm(EMPTY_FORM); setFormOpen(true) }
  const openEdit = (player) => {
    setEditingId(player.id)
    setForm({ name: player.name ?? '', birthday: formatBirthday(player.birthday), gender: player.gender ?? '', rank: player.rank ?? '' })
    setFormOpen(true)
  }
  const closeForm = () => { setFormOpen(false); setEditingId(null); setForm(EMPTY_FORM) }

  const onSubmit = () => handleSubmit({ editingId, form, onSuccess: closeForm })

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background font-sans text-foreground">
      <Header />
      <Tabs setActiveTab={setActiveTab} activeTab={activeTab} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="mx-auto w-full max-w-4xl flex-1 overflow-hidden px-4 py-4 md:px-8 md:py-6 flex flex-col gap-4">

          {activeTab === 'players' && (
            <PlayersTab
              players={players}
              loading={loading}
              search={search}
              setSearch={setSearch}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortDirection={sortDirection}
              setSortDirection={setSortDirection}
              formOpen={formOpen}
              editingId={editingId}
              form={form}
              setForm={setForm}
              submitting={submitting}
              deletingId={deletingId}
              canManagePlayers={canManagePlayers}
              onSubmit={onSubmit}
              onDelete={handleDelete}
              onOpenNew={openNew}
              onOpenEdit={openEdit}
              onCloseForm={closeForm}
            />
          )}

        </div>
      </div>
    </div>
  )
}

export default MembersPage