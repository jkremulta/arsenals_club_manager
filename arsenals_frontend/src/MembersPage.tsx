import { useState, useEffect } from 'react'

import playersApi from './services/players'
import helper from './utils/helper'
import { toast } from 'sonner'

import Header from './components/membersPage/Header'
import Tabs from './components/membersPage/Tabs'
import PlayersTab from './components/membersPage/PlayersTab'

const formatBirthday = (value) => value ? new Date(value).toISOString().slice(0, 10) : ''
const EMPTY_FORM = { name: '', birthday: '', gender: '', rank: '' }
const OWNER_USERNAME = 'joshiee02'

function MembersPage({ user }) {

  const [activeTab, setActiveTab] = useState('players')

  // ── Players state ─────────────────────────────────────────────────
  const [players, setPlayers]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [sortBy, setSortBy]             = useState('recent')
  const [sortDirection, setSortDirection] = useState('desc')
  const [formOpen, setFormOpen]         = useState(false)
  const [editingId, setEditingId]       = useState(null)
  const [form, setForm]                 = useState(EMPTY_FORM)
  const [submitting, setSubmitting]     = useState(false)
  const [deletingId, setDeletingId]     = useState(null)

  const canManagePlayers = user?.username === OWNER_USERNAME

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

  useEffect(() => {
    fetchPlayers()
  }, [])

  // ── Player handlers ───────────────────────────────────────────────
  const openNew  = () => { setEditingId(null); setForm(EMPTY_FORM); setFormOpen(true) }
  const openEdit = (player) => {
    setEditingId(player.id)
    setForm({ name: player.name ?? '', birthday: formatBirthday(player.birthday), gender: player.gender ?? '', rank: player.rank ?? '' })
    setFormOpen(true)
  }
  const closeForm = () => { setFormOpen(false); setEditingId(null); setForm(EMPTY_FORM) }

  const handleSubmit = async () => {
    const derivedSkill = helper.skillFromRank(form.rank)
    const isFormComplete = Boolean(form.name.trim() && form.gender && form.rank && derivedSkill)
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
              onSubmit={handleSubmit}
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