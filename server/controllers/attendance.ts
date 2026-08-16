import { Router } from 'express'
const attendanceRouter = Router()
import Training from '../models/training'
import { userExtractor } from '../utils/middleware'
import { Request, Response } from 'express'
import { checkInPlayer, removeAttendancePlayer, updateAttendancePlayer, manualCheckInPlayer } from 'services/attendance.service'
import type { PlayerDocument } from '../models/players'
import type { Document } from 'mongoose'

attendanceRouter.get('/', userExtractor, async (_request, response) => {
  const activeTraining = await Training.findOne({ isActive: true }).populate(
    'attendance',
    { name: 1, games_played: 1, paid: 1, skill: 1, late: 1 },
  )

  // to stop error on log in
  if (!activeTraining) {
    return response.status(200).json([])
  }

  response.json(activeTraining.attendance)
})

// Admin player attendance route
interface AttendanceBody {
  id: string
}

attendanceRouter.post('/', userExtractor, async (request: Request<unknown, unknown, AttendanceBody>, response: Response) => {
  const { id } = request.body || {}
  if (!id) return response.status(400).json({ error: 'id is required' })

  const result = await checkInPlayer(id)

  if (!result.ok) {
    return response.status(result.status).json({ error: result.error })
  }

  return response.status(201).json({
    ...result.training.toObject(),
    addedPlayer: result.player.name,
  })
})

attendanceRouter.delete('/:id', userExtractor, async (request: Request<{ id: string }>, response) => {
  const { id } = request.params

  const result = await removeAttendancePlayer(id)

  if (!result.ok) {
    return response.status(result.status).json({ error: result.error })
  }

  return response.status(200).json({ removedPlayer: result.player.name })
})

type AttendanceParams = { id: string } & Record<string, string>

type UpdatePlayerBody = Partial<Omit<PlayerDocument, keyof Document>>

attendanceRouter.put('/:id', userExtractor, async (
  request: Request<AttendanceParams, unknown, UpdatePlayerBody>,
  response,
) => {
  const { id } = request.params
  const result = await updateAttendancePlayer(id, request.body)

  if (!result.ok) {
    return response.status(result.status).json({ error: result.error })
  }

  return response.json(result.training)
})

// Manual route (players)
interface ManualAttendanceBody {
  name: string
}

attendanceRouter.post('/manual', async (
  request: Request<unknown, unknown, ManualAttendanceBody>,
  response,
) => {
  const { name } = request.body
  if (!name) return response.status(400).json({ error: 'Name is required' })

  const result = await manualCheckInPlayer(name)

  if (!result.ok) {
    return response.status(result.status).json({ error: result.error })
  }

  return response.status(201).json({ ok: true })
})

export default attendanceRouter
