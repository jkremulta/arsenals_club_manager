const trainingRouter = require('express').Router()
const Training = require('../models/training')
const Player = require('../models/players')
const trainingService = require('../services/training.service')
const { userExtractor } = require('../utils/middleware')

// gets all players in current training
trainingRouter.get('/', userExtractor, async (request, response) => {
  const activeTraining = await Training
    .findOne({ isActive: true })
    .populate('attendance', { name: 1, games_played: 1, paid: 1 })
    .populate('current_players')
    .populate('initialized_players')
    .populate('games_today')

  if (!activeTraining) {
    return response.status(404).json({ error: "No active training found" })
  }
  
  response.json(activeTraining)
})

// creates training
trainingRouter.post('/', userExtractor, async (request, response) => {
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

// deletes currentTraining 
trainingRouter.delete('/', userExtractor, async (request, response) => {
  const activeTraining = await Training.findOne({ isActive: true })

  if (!activeTraining) {
    return response.status(404).json({ error: "No active training found." })
  }

  await Player.updateMany(
    { _id: { $in: activeTraining.attendance } },
    { $set: { 
      games_played: 0,
      paid: false
    } 
  },
  )

  await Training.findByIdAndDelete(activeTraining.id)

  return response.status(200).json({ isActive: false })
})

// gets players for next game
trainingRouter.post('/initializeGame', userExtractor, async (request, response) => {
  const { skillGroup } = request.body || {}
  if (!skillGroup) return response.status(400).json({ error: "skill group is not defined" })

  const players = await trainingService.getPlayersBySkillGroup(skillGroup)

  return response.json(players)
})

// starts the game, this adds +1 to their games
trainingRouter.post('/startGame', userExtractor, async (request, response) => {
  const players = await trainingService.startGame()

  return response.json(players)
})


module.exports = trainingRouter