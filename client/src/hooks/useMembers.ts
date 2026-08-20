import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useState, useMemo } from "react"
import playersApi from "../services/players"
import helper from "../utils/helper"
import type { AxiosError } from 'axios'
import type { PlayerType } from "../services/players"
import type { Players } from "@/services/attendance"

export const useMembers = (token: string) => {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["players"] })
    queryClient.invalidateQueries({ queryKey: ["attendance"] })
    queryClient.invalidateQueries({ queryKey: ["training"] })
  }

  const playersQuery = useQuery({
    queryKey: ["players"],
    queryFn: () => playersApi.get(token),
  })

  const createPlayerMutation = useMutation({
    mutationFn: (payload: PlayerType) => playersApi.post(payload, token),
    onSuccess: (data) => {
      toast.success(`${data.name} registered`, {
        id: "keep this to only have one toast per update",
        duration: 2000,
      })
      invalidate()
    },
    onError: (e: AxiosError<{ error: string }>) => {
    toast.error(e.response?.data.error)
    },
  })

  const updatePlayerMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: PlayerType }) => playersApi.put(id, payload, token),
    onSuccess: () => {
      toast.success("Data updated", {
        id: "keep this to only have one toast per update",
        duration: 2000,
      })
      invalidate()
    },
    onError: (e: AxiosError<{ error: string }>) => {
    toast.error(e.response?.data.error)
    },
  })
  const deletePlayerMutation = useMutation({
    mutationFn: (id: string) => playersApi.delete(id, token),
    onSuccess: (data) => {
      toast.success(`${data.deletedPlayer} deleted.`, {
        id: "keep this to only have one toast per update",
        duration: 2000,
      })
      invalidate()
    },
    onError: (e: AxiosError<{ error: string }>) => {
    toast.error(e.response?.data.error)
    },
  })

  // replace the existing updateField with this
  const handleUpdatePlayer = async (player: Players, changes: Partial<Players>) => {
    // changes = { rank: 5, name: "New Name", ... } only the fields that actually changed
    const updated = { ...player, ...changes }
    if ("rank" in changes) {
      updated.skill = helper.skillFromRank(changes.rank)
    }
    const playerId = player.id
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...payload } = updated
    try {
      await updatePlayerMutation.mutateAsync({ id: playerId, payload })
    } catch {
      // errors handled in mutation onError
    }
  }

  const handleCreatePlayer = async ({ editingId, form, onSuccess }) => {
    const derivedSkill = helper.skillFromRank(form.rank)
    const isFormComplete = Boolean(
      form.name.trim() && form.gender && form.rank && derivedSkill
    )
    if (!isFormComplete) {
      toast.warning("Name, gender, and rank are required.", { duration: 2000 })
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

  const handleDeletePlayer = async (id) => {
    try {
      await deletePlayerMutation.mutateAsync(id)
    } catch {
      // errors handled in mutation onError
    }
  }

  // --- sort / filter state ---
  const [query, setQuery] = useState("") // search names

  const filteredPlayers = useMemo(() => {
    if (!query.trim()) return playersQuery.data

    const q = query.trim().toLowerCase()

    return playersQuery.data.filter((p) => p.name?.toLowerCase().includes(q))
  }, [playersQuery.data, query])

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
    membersLoading: playersQuery.isLoading, // only use for loading

    // sort/filter state
    query,
    setQuery,
    sortKey,
    sortDirection,
    toggleSortColumn,
    flipDirection,
    visiblePlayers,

    // handlers
    handleCreatePlayer,
    handleDeletePlayer,
    handleUpdatePlayer,

    // mutations (for isPending, variables, etc.)
    createPlayerMutation,
    updatePlayerMutation,
    deletePlayerMutation,
  }
}
