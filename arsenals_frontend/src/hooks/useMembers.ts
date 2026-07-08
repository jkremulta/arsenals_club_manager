import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useState, useMemo } from 'react'
import playersApi from '../services/players'
import helper from '../utils/helper'

export const useMembers = (token) => {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['members'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const playersQuery = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const data = await playersApi.get(token)
      if (data?.error) throw new Error(data.error)
      return data
    }
  })

  const players = playersQuery.data || []

  const createPlayerMutation = useMutation({
    mutationFn: (payload) => playersApi.post(payload, token),
    onSuccess: () => { 
      toast.success('Player registered', { duration: 2000 }); invalidate() 
    },
    onError: (e) => toast.error(e?.response?.data?.error, { duration: 2000 }),
  })

  const updatePlayerMutation = useMutation({
    mutationFn: ({ id, payload }) => playersApi.put(id, payload, token),
    onSuccess: () => { toast.success('Player updated', { id: 'keep this to only have one toast per update', duration: 2000 }); invalidate() },
    onError: (e) => toast.error(e?.response?.data?.error, { duration: 2000 }),
  })
  const deletePlayerMutation = useMutation({
    mutationFn: (id) => playersApi.delete(id, token),
    onSuccess: () => { toast.success('Player deleted.', { duration: 2000 }); invalidate() },
    onError: (e) => toast.error(e?.response?.data?.error, { duration: 2000 }),
  })

  // replace the existing updateField with this
  const handleUpdate = async (player, changes) => {
    // changes = { rank: 5, name: "New Name", ... } — only the fields that actually changed
    const updated = { ...player, ...changes }
    if ("rank" in changes) {
      updated.skill = helper.skillFromRank(changes.rank)
    }
    const playerId = player.id
    const { id, ...payload } = updated
    try {
      await updatePlayerMutation.mutateAsync({ id: playerId, payload })
    } catch {
      // errors handled in mutation onError
    }
  }

  const handleSubmit = async ({ editingId, form, onSuccess }) => {
    const derivedSkill = helper.skillFromRank(form.rank)
    const isFormComplete = Boolean(form.name.trim() && form.gender && form.rank && derivedSkill)
    if (!isFormComplete) {
      toast.warning('Name, gender, and rank are required.', { duration: 2000 })
      return
    }
    const payload = { ...form, name: form.name.trim(), skill: derivedSkill }
    try {
      if (editingId) {
        await updatePlayerMutation.mutateAsync({ id: editingId, payload })
      } else {
        await createPlayerMutation.mutateAsync(payload)
      }
      onSuccess?.()
    } catch {
      // errors handled in mutation onError
    }
  }

  const handleDelete = async (id) => {
    try {
      await deletePlayerMutation.mutateAsync(id)
    } catch {
      // errors handled in mutation onError
    }
  }

  // --- sort / filter state ---
  const [query, setQuery] = useState("") // search names

  const filteredPlayers = useMemo(() => {
    if (!query.trim()) return players

    const q = query.trim().toLowerCase()

     return players.filter((p) =>
      p.name?.toLowerCase().includes(q)
    )
  }, [players, query]);

  const [sortKey, setSortKey] = useState(null)
  const [sortDirection, setSortDirection] = useState("asc")

  const toggleSortColumn = (key) => {
    if (sortKey === key) {
      setSortKey(null)
      setSortDirection("asc")
    } else {
      setSortKey(key)
      setSortDirection("asc")
    }
  }

  const flipDirection = () => {
    setSortDirection((d) => (d === "asc" ? "desc" : "asc"))
  }

  const visiblePlayers = useMemo(() => {
    if (!sortKey) return filteredPlayers

    const sorted = [...filteredPlayers].sort((a, b) => {
      let aValue = a[sortKey]
      let bValue = b[sortKey]

      if (sortKey === "birthday") {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()

      } else if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1

      return 0
    })

    return sorted
  }, [filteredPlayers, sortKey, sortDirection])

  return {
    // query state
    playersQuery,
    players,   
    visiblePlayers,
    loading: playersQuery.isLoading,

    // sort/filter state + handlers
    query,
    setQuery,
    sortKey,
    sortDirection,
    toggleSortColumn,
    flipDirection,

    // handlers
    handleSubmit,
    handleDelete,
    handleUpdate,

    // mutations (for isPending, variables, etc.)
    createPlayerMutation,
    updatePlayerMutation,
    deletePlayerMutation,
  }
}