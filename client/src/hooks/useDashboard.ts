import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import trainingApi from "../services/training"
import attendanceApi from "../services/attendance"
import playersApi from "../services/players"

import { useUIStore } from "@/stores/useUIStore"

export const useDashboard = (token) => {
  const queryClient = useQueryClient()

  const { startTime, setCreateSessionOpen, setEndSessionOpen, setSkillGroup } =
    useUIStore()

  const invalidate = (queryKeys) => {
    queryKeys.forEach((queryKey) => {
      queryClient.invalidateQueries({ queryKey: [queryKey] })
    })
  }

  const trainingQuery = useQuery({
    queryKey: ["training"],
    queryFn: () => trainingApi.get(token),
  })

  const attendanceQuery = useQuery({
    queryKey: ["attendance"],
    queryFn: () => attendanceApi.get(token),
  })

  const playersQuery = useQuery({
    queryKey: ["players"],
    queryFn: () => playersApi.get(token),
  })

  const createTrainingMutation = useMutation({
    mutationFn: (startDateIso) => trainingApi.post(startDateIso, token),
    onSuccess: () => {
      toast.success("Training session created.", { duration: 2000 })
      setCreateSessionOpen(false)
      invalidate(["training"])
    },
    onError: (e) => toast.error(e?.response?.data?.error),
  })

  const endTrainingMutation = useMutation({
    mutationFn: () => trainingApi.delete(token),
    onSuccess: () => {
      toast.success("Training ended.", { duration: 2000 })
      setEndSessionOpen(false)
      invalidate(["training", "attendance"])
    },
    onError: (e) => toast.error(e?.response?.data?.error),
  })

  const addPlayerMutation = useMutation({
    mutationFn: (playerId) => attendanceApi.post(playerId, token),
    onSuccess: () => {
      toast.success("Player added.")
      invalidate(["attendance"])
    },
    onError: (e) => toast.error(e?.response?.data?.error),
  })

  const removePlayerMutation = useMutation({
    mutationFn: (playerId) => attendanceApi.delete(playerId, token),
    onSuccess: () => {
      toast.success("Player removed.", { duration: 2000 })
      invalidate(["attendance"])
    },
    onError: (e) => toast.error(e?.response?.data?.error),
  })

  const togglePaidMutation = useMutation({
    mutationFn: ({ id, paid }) => attendanceApi.put(id, token, { paid }),
    onSuccess: () => invalidate(["attendance"]),
    onError: (e) => toast.error(e?.response?.data?.error, { duration: 2000 }),
  })

  const initializeGameMutation = useMutation({
    mutationFn: (skillGroup) => trainingApi.initializeGame(skillGroup, token),
    onSuccess: () => {
      toast.success("Game initialized.", { duration: 2000 })
      invalidate(["training"])
    },
    onError: (e) => toast.error(e?.response?.data?.error, { duration: 2000 }),
  })

  const startGameMutation = useMutation({
    mutationFn: () => trainingApi.startGame(token),
    onSuccess: () => {
      toast.success("Game started!", { duration: 2000 })
      setSkillGroup("")
      invalidate(["training", "players"])
    },
    onError: (e) => toast.error(e?.response?.data?.error, { duration: 2000 }),
  })

  const replacePlayerMutation = useMutation({
    mutationFn: ({ outPlayerId, inPlayerId }) =>
      trainingApi.replacePlayer(outPlayerId, inPlayerId, token),
    onSuccess: () => {
      toast.success("Player replaced.", { duration: 2000 })
      invalidate(["training"])
    },
    onError: (e) => toast.error(e?.response?.data?.error, { duration: 2000 }),
  })

  // checks the attendance for players that has paid
  const paidIds = new Set(
    attendanceQuery.data?.filter((p) => p.paid).map((p) => p.id)
  )
  // toggles paid status
  const handleTogglePaid = (id) => {
    togglePaidMutation.mutate({ id, paid: !paidIds.has(id) })
  }

  const handleCreateTraining = () => {
    const [hours = "0", minutes = "0"] = startTime.split(":")
    const startDate = new Date()
    startDate.setHours(Number(hours), Number(minutes), 0, 0)
    createTrainingMutation.mutate(startDate.toISOString())
  }

  const handleInitializeGame = ({ skillGroup }) => {
    initializeGameMutation.mutate({ skillGroup })
  }

  const handleAddPlayer = (id) => {
    addPlayerMutation.mutate(id)
  }

  const handleRemovePlayer = (id) => {
    removePlayerMutation.mutate(id)
  }

  const handleStartGame = () => {
    startGameMutation.mutate()
  }

  const handleReplacePlayer = (players) => {
    replacePlayerMutation.mutate(players)
  }

  const dashboardLoading =
    trainingQuery.isLoading ||
    attendanceQuery.isLoading ||
    playersQuery.isLoading

  return {
    // query state
    training: trainingQuery.data,
    attendance: attendanceQuery.data || [],
    players: playersQuery.data || [],
    paidIds,

    // dashboardLoading
    dashboardLoading,

    // handlers
    handleCreateTraining,
    handleInitializeGame,
    handleAddPlayer,
    handleRemovePlayer,
    handleStartGame,
    handleTogglePaid,
    handleReplacePlayer,

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
