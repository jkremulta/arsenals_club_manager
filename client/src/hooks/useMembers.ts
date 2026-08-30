import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useState, useMemo } from "react"
import { playersApi } from "../services/players"
import helper from "../utils/helper"
import type { AxiosError } from 'axios'
import type { CreatePlayer } from '../../../shared/types/player'
import type { Player } from "../../../shared/types/player"

type SortableKey = keyof Pick<Player, "name" | "birthday" | "rank" | "gender">
type SortDirection = "asc" | "desc"

export const useMembers = (token: string) => {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["players"] })
    queryClient.invalidateQueries({ queryKey: ["attendance"] })
    queryClient.invalidateQueries({ queryKey: ["training"] })
  }

  const playersQuery = useQuery({
    queryKey: ["players"],
    queryFn: () => playersApi.getPlayers(token),
  })

  const createPlayerMutation = useMutation({
    mutationFn: (payload: CreatePlayer) => playersApi.createPlayer(payload, token),
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
    mutationFn: ({ id, payload }: { id: string, payload: CreatePlayer }) => playersApi.updatePlayer(id, payload, token),
    onSuccess: (data) => {
      toast.success(`${data.name} updated`, {
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
    mutationFn: (id: string) => playersApi.deletePlayer(id, token),
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

  const handleUpdatePlayer = async (player: Player, changes: Partial<Player>) => {
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

  const handleDeletePlayer = async (id: string) => {
    try {
      await deletePlayerMutation.mutateAsync(id)
    } catch {
      // errors handled in mutation onError
    }
  }

  // --- sort / filter state ---
  const [query, setQuery] = useState("") // search names

  const filteredPlayers = useMemo(() => {
  const players = playersQuery.data ?? []
  if (!query.trim()) return players
  const q = query.trim().toLowerCase()
  return players.filter((p) => p.name?.toLowerCase().includes(q))
}, [playersQuery.data, query])

const [sortKey, setSortKey] = useState<SortableKey | null>(null)
const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

const toggleSortColumn = (key: SortableKey) => {
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

const getComparableValue = (player: Player, key: SortableKey): string | number => {
  const value = player[key]
  if (key === "birthday") return new Date(value as string).getTime()
  if (typeof value === "string") return value.toLowerCase()
  return value as number
}

const visiblePlayers = useMemo(() => {
  if (!sortKey) return filteredPlayers

  const direction = sortDirection === "asc" ? 1 : -1
  return [...filteredPlayers].sort((a, b) => {
    const aValue = getComparableValue(a, sortKey)
    const bValue = getComparableValue(b, sortKey)
    if (aValue < bValue) return -1 * direction
    if (aValue > bValue) return 1 * direction
    return 0
  })
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
