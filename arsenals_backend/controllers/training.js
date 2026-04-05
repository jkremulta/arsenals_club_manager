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

  // if (!activeTraining) {
  //   return response.status(404).json({ error: "No active training found" })
  // }

  // to stop error on get on log in
  if (!activeTraining) {
    return response.status(200).json(null)
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
      paid: false,
      games_by_skill: {
        beginner: 0,
        intermediate: 0,
        advanced: 0
      }
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
  const { currentGameSkillGroup } = request.body || {}
  const players = await trainingService.startGame(currentGameSkillGroup)

  return response.json(players)
})

trainingRouter.patch('/replacePlayer', userExtractor, async (request, response) => {
  const { outPlayerId, inPlayerId } = request.body
  if (!outPlayerId || !inPlayerId) {
    return response.status(400).json({ error: 'outPlayerId and inPlayerId are required' })
  }
  const activeTraining = await Training.findOne({ isActive: true })
  if (!activeTraining) return response.status(404).json({ error: 'No active training' })

  const index = activeTraining.initialized_players.findIndex(
    (playerId) => playerId.toString() === outPlayerId
  )
  if (index === -1) return response.status(404).json({ error: 'Player not in initialized list' })

  activeTraining.initialized_players[index] = inPlayerId
  await activeTraining.save()

  const updatedPlayers = await Player.find({ _id: { $in: activeTraining.initialized_players } })
  const playersById = new Map(updatedPlayers.map((player) => [player.id, player]))
  const orderedPlayers = activeTraining.initialized_players
    .map((playerId) => playersById.get(playerId.toString()))
    .filter(Boolean)

  return response.json(orderedPlayers)
})

module.exports = trainingRouter
