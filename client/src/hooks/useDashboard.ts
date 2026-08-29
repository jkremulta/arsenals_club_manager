import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { AxiosError } from 'axios'

import { trainingApi } from "../services/training"
import { attendanceApi } from "../services/attendance"
import { playersApi }  from "../services/players"

import { useUIStore } from "@/stores/useUIStore"
import type { Skill } from "../../../shared/types/player"

export const useDashboard = (token: string) => {
  const queryClient = useQueryClient()

  const { startTime, setCreateSessionOpen, setEndSessionOpen, setSkillGroup } =
    useUIStore()

  const invalidate = (queryKeys: string[]) => {
    queryKeys.forEach((queryKey) => {
      queryClient.invalidateQueries({ queryKey: [queryKey] })
    })
  }

  const trainingQuery = useQuery({
    queryKey: ["training"],
    queryFn: () => trainingApi.getTraining(token),
  })

  const attendanceQuery = useQuery({
    queryKey: ["attendance"],
    queryFn: () => attendanceApi.getAttendance(token),
  })

  const playersQuery = useQuery({
    queryKey: ["players"],
    queryFn: () => playersApi.getPlayers(token),
  })

  const createTrainingMutation = useMutation({
    mutationFn: (startDateIso: string) => trainingApi.createTraining(startDateIso, token),
    onSuccess: () => {
      toast.success("Training session created.", {
        id: "keep this to only have one toast per update",
        duration: 2000,
      })
      setCreateSessionOpen(false)
      invalidate(["training"])
    },
    onError: (e: AxiosError<{ error: string }>) => {
    toast.error(e.response?.data.error)
    },
  })

  const endTrainingMutation = useMutation({
    mutationFn: () => trainingApi.deleteTraining(token),
    onSuccess: () => {
      toast.success("Training ended.", {
        id: "keep this to only have one toast per update",
        duration: 2000,
      })
      setEndSessionOpen(false)
      invalidate(["training", "attendance"])
    },
    onError: (e: AxiosError<{ error: string }>) => {
    toast.error(e.response?.data.error)
    },
  })

  const addPlayerMutation = useMutation({
    mutationFn: (playerId: string) => attendanceApi.addAttendance(playerId, token),
    onSuccess: (data) => {
      toast.success(`${data.addedPlayer} checked in.`, {
        id: "keep this to only have one toast per update",
        duration: 2000,
      })
      invalidate(["attendance"])
    },
    onError: (e: AxiosError<{ error: string }>) => {
    toast.error(e.response?.data.error)
    },
  })

  const removePlayerMutation = useMutation({
    mutationFn: (playerId: string) => attendanceApi.deleteAttendance(playerId, token),
    onSuccess: (data) => {
      toast.success(`${data.removedPlayer} removed from attendance.`, {
        id: "keep this to only have one toast per update",
        duration: 2000,
      })
      invalidate(["attendance"])
    },
    onError: (e: AxiosError<{ error: string }>) => {
    toast.error(e.response?.data.error)
    },
  })

  const togglePaidMutation = useMutation({
    mutationFn: ({ id, paid } : { id: string, paid: boolean }) => attendanceApi.updateAttendance(id, token, { paid }),
    onSuccess: () => invalidate(["attendance"]),
    onError: (e: AxiosError<{ error: string }>) => {
    toast.error(e.response?.data.error)
    },
  })

  const initializeGameMutation = useMutation({
    mutationFn: (skillGroup: Skill) => trainingApi.initializeGame(skillGroup, token),
    onSuccess: () => {
      toast.success("Game initialized.", {
        id: "keep this to only have one toast per update",
        duration: 2000,
      })
      invalidate(["training"])
    },
    onError: (e: AxiosError<{ error: string }>) => {
    toast.error(e.response?.data.error)
    },
  })

  const startGameMutation = useMutation({
    mutationFn: () => trainingApi.startGame(token),
    onSuccess: () => {
      toast.success("Game started!", {
        id: "keep this to only have one toast per update",
        duration: 2000,
      })
      setSkillGroup("")
      invalidate(["training", "attendance"])
    },
    onError: (e: AxiosError<{ error: string }>) => {
    toast.error(e.response?.data.error)
    },
  })

  const replacePlayerMutation = useMutation({
    mutationFn: ({ outPlayerId, inPlayerId }: { outPlayerId: string, inPlayerId: string }) =>
      trainingApi.replacePlayer(outPlayerId, inPlayerId, token),
    onSuccess: (data) => {
      toast.success(
        `${data.replacedPlayer} was replaced by ${data.replacementPlayer}.`,
        { id: "keep this to only have one toast per update", duration: 2000 }
      )
      invalidate(["training"])
    },
    onError: (e: AxiosError<{ error: string }>) => {
    toast.error(e.response?.data.error)
    },
  })

  // checks the attendance for players that has paid
  const paidIds = new Set(
    attendanceQuery.data?.filter((p) => p.paid).map((p) => p.id)
  )
  // toggles paid status
  const handleTogglePaid = (id: string) => {
    togglePaidMutation.mutate({ id, paid: !paidIds.has(id) })
  }

  const handleCreateTraining = () => {
    const [hours = "0", minutes = "0"] = startTime.split(":")
    const startDate = new Date()
    startDate.setHours(Number(hours), Number(minutes), 0, 0)
    createTrainingMutation.mutate(startDate.toISOString())
  }

  const handleInitializeGame = ({ skillGroup }: { skillGroup: Skill }) => {
    initializeGameMutation.mutate(skillGroup)
  }

  const handleAddPlayer = (id: string) => {
    addPlayerMutation.mutate(id)
  }

  const handleRemovePlayer = (id: string) => {
    removePlayerMutation.mutate(id)
  }

  const handleStartGame = () => {
    startGameMutation.mutate()
  }

  const handleReplacePlayer = (players: { outPlayerId: string; inPlayerId: string }) => {
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
