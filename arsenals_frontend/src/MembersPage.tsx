import { useState, useEffect } from 'react'

import attendanceApi from './services/attendance'
import playersApi from './services/players'
import teamsApi from './services/team'
import helper from './utils/helper'
import { toast } from 'sonner'

import Header from './components/membersPage/Header'
import Tabs from './components/membersPage/Tabs'
import PlayersTab from './components/membersPage/PlayersTab'
import TeamsTab from './components/membersPage/TeamsTab'

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

  // ── Teams state ───────────────────────────────────────────────────
  const [teams, setTeams]                       = useState([])
  const [teamsLoading, setTeamsLoading]         = useState(true)
  const [attendance, setAttendance]             = useState([])
  const [newTeamName, setNewTeamName]           = useState('')
  const [creatingTeam, setCreatingTeam]         = useState(false)
  const [deletingTeamId, setDeletingTeamId]     = useState(null)
  const [addingToTeam, setAddingToTeam]         = useState(null)
  const [removingFromTeam, setRemovingFromTeam] = useState(null)
  const [renamingTeamId, setRenamingTeamId]     = useState(null)
  const [renameValue, setRenameValue]           = useState('')
  const [renamingLoading, setRenamingLoading]   = useState(null)
  const [collapsedTeams, setCollapsedTeams]     = useState(new Set())

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
      console.log(data)
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
    } finally { setRenamingLoading(null) }
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

          {activeTab === 'teams' && (
            <TeamsTab
              teams={teams}
              teamsLoading={teamsLoading}
              attendance={attendance}
              newTeamName={newTeamName}
              setNewTeamName={setNewTeamName}
              creatingTeam={creatingTeam}
              deletingTeamId={deletingTeamId}
              addingToTeam={addingToTeam}
              removingFromTeam={removingFromTeam}
              renamingTeamId={renamingTeamId}
              setRenamingTeamId={setRenamingTeamId}
              renameValue={renameValue}
              setRenameValue={setRenameValue}
              renamingLoading={renamingLoading}
              collapsedTeams={collapsedTeams}
              onCreateTeam={handleCreateTeam}
              onDeleteTeam={handleDeleteTeam}
              onAddToTeam={handleAddToTeam}
              onRemoveFromTeam={handleRemoveFromTeam}
              onRenameTeam={handleRenameTeam}
              onToggleCollapse={toggleTeamCollapse}
            />
          )}

        </div>
      </div>
    </div>
  )
}

export default MembersPage