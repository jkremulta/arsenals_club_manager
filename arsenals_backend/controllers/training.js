const trainingRouter = require('express').Router()
const Training = require('../models/training')
const Player = require('../models/players')
const trainingService = require('../services/training.service')

// add token requirement to all routers here 

trainingRouter.get('/', async (request, response) => {
  const activeTraining = await Training
    .findOne({ isActive: true })
    .populate('attendance', { name: 1, games_played: 1 })
    .populate('current_players')

  if (!activeTraining) {
    return response.status(404).json({ error: "No active training found" })
  }
  
  response.json(activeTraining)
})


trainingRouter.post('/', async (request, response) => {
  const activeTraining = await Training.findOne({ isActive: true })
  if (activeTraining) {
    return response.status(400).json({
      error: "training already exists"
    })
  }
  
  const { startTime } = request.body || {}
  if (!startTime) return response.status(400).json({ error: "startTime is required" })

  const newTraining = new Training({
    startTime: new Date(startTime),
    isActive: true
  })

  const savedTraining = await newTraining.save()
  response.status(201).json(savedTraining)
})

trainingRouter.delete('/', async (request, response) => {
  const activeTraining = await Training.findOne({ isActive: true })

  if (!activeTraining) {
    return response.status(404).json({ error: "No active training found." })
  }

  await Player.updateMany(
    { _id: { $in: activeTraining.attendance } },
    { $set: { games_played: 0 } }
  )

  await Training.findByIdAndDelete(activeTraining.id)

  return response.status(200).json({ isActive: false })
})


trainingRouter.post('/initializeGame', async (request, response) => {
  const { skillGroup } = request.body || {}
  if (!skillGroup) return response.status(400).json({ error: "skill group is not defined" })

  const players = await trainingService.getPlayersBySkillGroup(skillGroup)

  return response.json(players)
})

trainingRouter.post('/startGame', async (request, response) => {
  const players = await trainingService.startGame()

  return response.json(players)
})


module.exports = trainingRouter