import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from "sonner";

import trainingApi from '../services/training'
import attendanceApi from '../services/attendance'
import playersApi from '../services/players'

import { useUIStore } from '@/stores/useUIStore'

export const useDashboard = (token) => {
  const queryClient = useQueryClient()

  const { startTime, setCreateSessionOpen, setEndSessionOpen } = useUIStore()

  const dashboardQuery = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const [trainingRes, attendanceRes, playersRes] = await Promise.all([
        trainingApi.get(token),
        attendanceApi.get(token),
        playersApi.get(token),
      ])
      return { training: trainingRes, attendance: attendanceRes, players: playersRes }
    },
  })

  // use to refetch data
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['dashboard'] })

  const createTrainingMutation = useMutation({
    mutationFn: (startDateIso) => trainingApi.post(startDateIso, token),
    onSuccess: () => { toast.success('Training session created.', { duration: 2000 }); setCreateSessionOpen(false); invalidate() },
    onError: (e) => toast.error(e?.response?.data?.error),
  })

  const endTrainingMutation = useMutation({
    mutationFn: () => trainingApi.delete(token),
    onSuccess: () => { toast.success('Training ended.', { duration: 2000 }); setEndSessionOpen(false); invalidate() },
    onError: (e) => toast.error(e?.response?.data?.error),
  })

  const addPlayerMutation = useMutation({
    mutationFn: (playerId) => attendanceApi.post(playerId, token),
    onSuccess: () => { toast.success('Player added.'); invalidate() },
    onError: (e) => toast.error(e?.response?.data?.error),
  })

  const removePlayerMutation = useMutation({
    mutationFn: (playerId) => attendanceApi.delete(playerId, token),
    onSuccess: () => { toast.success('Player removed.', { duration: 2000 }); invalidate() },
    onError: (e) => toast.error(e?.response?.data?.error),
  })

  const togglePaidMutation = useMutation({
    mutationFn: ({ id, paid }) => attendanceApi.put(id, token, { paid }),
    onSuccess: invalidate,
    onError: (e) => toast.error(e?.response?.data?.error, { duration: 2000 }),
  })

  const initializeGameMutation = useMutation({
    mutationFn: (skillType) => trainingApi.initializeGame(skillType, token),
    onSuccess: () => { toast.success('Game initialized.', { duration: 2000 }); invalidate() },
    onError: (e) => toast.error(e?.response?.data?.error, { duration: 2000 }),
  })

  const startGameMutation = useMutation({
    mutationFn: () => trainingApi.startGame(token),
    onSuccess: () => { toast.success('Game started!', { duration: 2000 }); invalidate() },
    onError: (e) => toast.error(e?.response?.data?.error, { duration: 2000 }),
  })

  const replacePlayerMutation = useMutation({
    mutationFn: ({ outPlayerId, inPlayerId }) => trainingApi.replacePlayer(outPlayerId, inPlayerId, token),
    onSuccess: () => { toast.success('Player replaced.', { duration: 2000 }); invalidate() },
    onError: (e) => toast.error(e?.response?.data?.error, { duration: 2000 }),
  })

  // checks the attendance for players that has paid
  const paidIds = new Set(dashboardQuery.data?.attendance.filter(p => p.paid).map(p => p.id))
  // toggles paid status
  const togglePaid = (id) => {
    togglePaidMutation.mutate({ id, paid: !paidIds.has(id) })
  }

  const handleCreateTraining = () => {
    const [hours = '0', minutes = '0'] = startTime.split(':')
    const startDate = new Date()
    startDate.setHours(Number(hours), Number(minutes), 0, 0)
    createTrainingMutation.mutate(startDate.toISOString())
  }


  return {
    // query state
    dashboardQuery,
    training: dashboardQuery.data?.training, 
    attendance: dashboardQuery.data?.attendance || [], 
    players : dashboardQuery.data?.players || [], 
    paidIds,

    // handlers
    handleCreateTraining,
    togglePaid,

    // mutations (for isPending, variables, etc.)
    createTrainingMutation,
    endTrainingMutation,
    addPlayerMutation,
    removePlayerMutation,
    togglePaidMutation,
    initializeGameMutation,
    startGameMutation,
    replacePlayerMutation,
  }
}