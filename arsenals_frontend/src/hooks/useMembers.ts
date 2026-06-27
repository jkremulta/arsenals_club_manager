import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'


import playersApi from '../services/players'
import helper from '../utils/helper'

export const useMembers = (token) => {
  const queryClient = useQueryClient()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['members'] })

  const playersQuery = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const data = await playersApi.get(token)
      if (data?.error) throw new Error(data.error)
      return data
    }
  })

  const createPlayerMutation = useMutation({
    mutationFn: (payload) => playersApi.post(payload, token),
    onSuccess: () => { 
      toast.success('Player registered', { duration: 2000 }); invalidate() 
    },
    onError: (e) => toast.error(e?.response?.data?.error, { duration: 2000 }),
  })

  const updatePlayerMutation = useMutation({
    mutationFn: ({ id, payload }) => playersApi.put(id, payload, token),
    onSuccess: () => { toast.success('Player updated', { duration: 2000 }); invalidate() },
    onError: (e) => toast.error(e?.response?.data?.error, { duration: 2000 }),
  })

  const deletePlayerMutation = useMutation({
    mutationFn: (id) => playersApi.delete(id, token),
    onSuccess: () => { toast.success('Player deleted.', { duration: 2000 }); invalidate() },
    onError: (e) => toast.error(e?.response?.data?.error, { duration: 2000 }),
  })

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

  return {
    // query state
    playersQuery,
    players: playersQuery.data || [],
    loading: playersQuery.isLoading,
 
    // handlers
    handleSubmit,
    handleDelete,
 
    // mutations (for isPending, variables, etc.)
    createPlayerMutation,
    updatePlayerMutation,
    deletePlayerMutation,
  }

} 