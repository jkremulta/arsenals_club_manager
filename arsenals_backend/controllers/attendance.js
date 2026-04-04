const attendanceRouter = require('express').Router()
const Training = require('../models/training')
const Player = require('../models/players')
const { userExtractor } = require('../utils/middleware')

// gets all players in attendance
attendanceRouter.get('/', userExtractor, async (request, response) => {

  const activeTraining = await Training
    .findOne({ isActive: true })
    .populate('attendance', { name: 1, games_played: 1, paid: 1, skill: 1 })

  // to stop error on log in
  if (!activeTraining) {
    return response.status(200).json([])
  }

  // if (!activeTraining) {
  //   return response.status(404).json({ error: "No active training found" })
  // }
  
  response.json(activeTraining.attendance)
})

// add player in attendance
attendanceRouter.post('/', async (request, response) => {
  const { id } = request.body || {}
  if (!id) return response.status(400).json({ error: "id is required" })

  const activeTraining = await Training.findOne({ isActive: true })

  if (!activeTraining) {
    return response.status(400).json({ error: 'No active training' })
  }

  if (!activeTraining.attendance.includes(id)) {
    activeTraining.attendance.push(id)
    await activeTraining.save()
  }

  await activeTraining.save()
  const populated = await Training.findOne({ isActive: true })
    .populate('attendance')

  return response.status(201).json(populated)
})

// removes player from attendance
attendanceRouter.delete('/:id', userExtractor, async (request, response) => {
  const { id } = request.params

  const activeTraining = await Training.findOne({ isActive: true })
  
  if (!activeTraining) {
    return response.status(404).json({ error: "no active training found" })
  }

  activeTraining.attendance = activeTraining.attendance.filter(
    playerId => playerId.toString() !== id
  )

  await activeTraining.save()

  return response.status(204).end()
})

attendanceRouter.put('/:id', userExtractor, async (request, response) => {
  const { id } = request.params
  const body = request.body
  
  const activeTraining = await Training.findOne({ isActive: true })
  if(!activeTraining) {
    return response.status(404).json({ error: 'No active training' })
  }

  const inAttendance = activeTraining.attendance.some(
    p => p.toString() === id
  )
  if (!inAttendance) {
    return response.status(404).json({ error: 'Player is not in attendance' })
  }

  const updatedPlayer = await Player.findByIdAndUpdate(
    id,
    { ...body },
    { returnDocument: 'after' }
  )

  if (!updatedPlayer) {
    return response.status(404).json({ error: 'Player not found' })
  }

  const updatedTraining = await Training.findOne({ isActive: true })
    .populate('attendance')
  return response.json(updatedTraining)
})

module.exports = attendanceRouter

