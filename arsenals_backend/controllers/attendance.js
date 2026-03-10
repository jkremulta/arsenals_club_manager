const attendanceRouter = require('express').Router()
const Training = require('../models/training')
const { userExtractor } = require('../utils/middleware')

// gets all players in attendance
attendanceRouter.get('/', userExtractor, async (request, response) => {

  const activeTraining = await Training
    .findOne({ isActive: true })
    .populate('attendance', { name: 1, games_played: 1 })

  if (!activeTraining) {
    return response.status(404).json({ error: "No active training found" })
  }
  
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
  } else {
    return response.status(400).json({ error: "User is already in attendance" })
  }


  const updatedAttendance = await activeTraining.save()
  return response.status(201).json(updatedAttendance)
})

// removes player from attendance
attendanceRouter.delete('/:id', userExtractor, async (request, response) => {
  const { id } = request.params

  const activeTraining = await Training.findOne({ isActive: true })
  if (!activeTraining) {
    return response.status(404).json({ error: "no active training found" })
  }

  const index = activeTraining.attendance.indexOf(id)
  if (index === -1) {
    return response.status(404).json({ error: "player not in attendance" })
  }

  activeTraining.attendance.splice(index, 1)
  await activeTraining.save()

  response.status(204).end()
})

module.exports = attendanceRouter

