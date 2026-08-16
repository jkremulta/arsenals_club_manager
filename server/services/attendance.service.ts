import Training from '../models/training'
import Player from '../models/players'
import { Types } from 'mongoose'
import type { TrainingDocument } from '../models/training'
import type { PlayerDocument } from '../models/players'
import { Document } from 'mongoose'

const isAttendanceOpen = (startTime: Date) => {
  const now = Date.now()
  const start = new Date(startTime).getTime()
  // Allow check-in starting 30 minutes before start time
  return now >= start - 30 * 60 * 1000
}

type AttendanceResult =
  | { ok: true; training: TrainingDocument; player: PlayerDocument }
  | { ok: false; status: number; error: string }

export const checkInPlayer = async (playerId: string): Promise<AttendanceResult> => {
  const activeTraining = await Training.findOne({ isActive: true })

  if (!activeTraining) {
    return { ok: false, status: 400, error: 'No active training' }
  }

  if (!isAttendanceOpen(activeTraining.startTime)) {
    return {
      ok: false,
      status: 400,
      error: 'Attendance is not open yet. Check-in opens 30 minutes before training starts.',
    }
  }

  const player = await Player.findById(playerId)
  if (!player) {
    return { ok: false, status: 404, error: 'Player not found' }
  }

  const alreadyCheckedIn = activeTraining.attendance.includes(new Types.ObjectId(playerId))


  if (!alreadyCheckedIn) {
    activeTraining.attendance.push(new Types.ObjectId(playerId))
    await activeTraining.save()

    const msElapsed = Date.now() - new Date(activeTraining.startTime).getTime()
    const isLate = msElapsed > 45 * 60 * 1000
    await Player.findByIdAndUpdate(playerId, { late: isLate })
  }

  const populatedTraining = await activeTraining.populate('attendance')

  return { ok: true, training: populatedTraining, player }
}

export const removeAttendancePlayer = async (playerId: string): Promise<AttendanceResult> => {
  const activeTraining = await Training.findOne({ isActive: true })
  if (!activeTraining) {
    return { ok: false, status: 404, error: 'No active training found.' }
  }

  const player = await Player.findById(playerId)
  if (!player) {
    return { ok: false, status: 404, error: 'Player not found.' }
  }

  const isInInitialized = activeTraining.initialized_players.some(
    (id) => id.toString() === playerId,
  )

  if (isInInitialized) {
    return { ok: false, status: 400, error: 'Cannot remove a player who is initialized for a game.' }
  }

  activeTraining.attendance = activeTraining.attendance.filter(
    (id) => id.toString() !== playerId,
  )
  await activeTraining.save()

  return { ok: true, training: activeTraining, player }
}

type UpdatePlayerBody = Partial<Omit<PlayerDocument, keyof Document>>

export const updateAttendancePlayer = async (
  playerId: string,
  updates: UpdatePlayerBody,
): Promise<AttendanceResult> => {
  const activeTraining = await Training.findOne({ isActive: true })
  if (!activeTraining) {
    return { ok: false, status:404, error: 'No active training' }
  }

  const inAttendance = activeTraining.attendance.some((p) => p.toString() === playerId)
  if (!inAttendance) {
    return { ok: false, status: 404, error: 'Player not found' }
  }

  const updatedPlayer = await Player.findByIdAndUpdate(playerId, { ...updates }, { returnDocument: 'after' })
  if (!updatedPlayer) {
    return { ok: false, status: 404, error: 'Player not found' }
  }

  const updatedTraining = await Training.findOne({ isActive: true }).populate('attendance')
  if (!updatedTraining) {
    return { ok: false, status: 500, error: 'Failed to reload training' }
  }

  return { ok: true, training: updatedTraining, player: updatedPlayer }
}

export const manualCheckInPlayer = async (name: string): Promise<AttendanceResult> => {
  const activeTraining = await Training.findOne({ isActive: true })
  if (!activeTraining) {
    return { ok: false, status: 400, error: 'No active training session' }
  }

  if (!isAttendanceOpen(activeTraining.startTime)) {
    return {
      ok: false,
      status: 400,
      error: 'Attendance is not open yet. Check-in opens 30 minutes before training starts.',
    }
  }

  const words = name.trim().split(/\s+/)
  const wordFilters = words.map((word) => ({
    name: { $regex: word, $options: 'i' },
  }))
  const matches = await Player.find({ $and: wordFilters }).select('_id name')

  if (matches.length === 0) {
    return { ok: false, status: 404, error: 'Name not registered.' }
  }
  if (matches.length > 1) {
    return { ok: false, status: 409, error: 'Multiple players matched. Please type your full name.' }
  }

  const player = matches[0]!

  const alreadyIn = activeTraining.attendance
    .map((id) => id.toString())
    .includes(player._id.toString())
  if (alreadyIn) {
    return { ok: false, status: 400, error: 'You are already checked in.' }
  }

  activeTraining.attendance.push(player._id)
  await activeTraining.save()

  const msElapsed = Date.now() - new Date(activeTraining.startTime).getTime()
  const isLate = msElapsed > 45 * 60 * 1000
  await Player.findByIdAndUpdate(player._id, { late: isLate })

  return { ok: true, training: activeTraining, player }
}