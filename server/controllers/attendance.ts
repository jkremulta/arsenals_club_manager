import { Router, Request, Response } from 'express'
import Training from '../models/training'
import { userExtractor } from '../utils/middleware'
import { checkInPlayer, removeAttendancePlayer, updateAttendancePlayer, manualCheckInPlayer } from 'services/attendance.service'
import type { Player } from '../../shared/types/player'

const attendanceRouter = Router()

type RouteParams = { id: string } & Record<string, string>

interface CheckInBody {
  id: string
}
interface ManualCheckInBody {
  name: string
}
type UpdatePlayerBody = Partial<Player>

attendanceRouter.get('/', userExtractor, async (_request, response) => {
  const activeTraining = await Training.findOne({ isActive: true }).populate(
    'attendance',
    { name: 1, games_played: 1, paid: 1, skill: 1, late: 1 },
  )

  if (!activeTraining) {
    return response.status(200).json([])
  }

  response.json(activeTraining.attendance)
})

attendanceRouter.post('/', userExtractor, async (request: Request<unknown, unknown, CheckInBody>, response: Response) => {
  const { id } = request.body || {}
  if (!id) return response.status(400).json({ error: 'id is required' })

  const result = await checkInPlayer(id)
  if (!result.ok) {
    return response.status(result.status).json({ error: result.error })
  }

  return response.status(201).json({
    addedPlayer: result.player.name,
  })
})

attendanceRouter.delete('/:id', userExtractor, async (request: Request<RouteParams>, response) => {
  const { id } = request.params

  const result = await removeAttendancePlayer(id)
  if (!result.ok) {
    return response.status(result.status).json({ error: result.error })
  }

  return response.status(200).json({ removedPlayer: result.player.name })
})

// payment update
attendanceRouter.put('/:id', userExtractor, async (request: Request<RouteParams, unknown, UpdatePlayerBody>, response) => {
  const { id } = request.params
  const result = await updateAttendancePlayer(id, request.body)

  if (!result.ok) {
    return response.status(result.status).json({ error: result.error })
  }

  return response.status(200).json({ ok: true })
})

attendanceRouter.post('/manual', async (request: Request<unknown, unknown, ManualCheckInBody>, response) => {
  const { name } = request.body
  if (!name) return response.status(400).json({ error: 'Name is required' })

  const result = await manualCheckInPlayer(name)
  if (!result.ok) {
    return response.status(result.status).json({ error: result.error })
  }

  return response.status(201).json({ ok: true })
})

export default attendanceRouter