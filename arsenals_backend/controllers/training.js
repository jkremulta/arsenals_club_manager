const trainingRouter = require('express').Router()
const Training = require('../models/training')
const Player = require('../models/players')
const Team = require('../models/team')
const trainingService = require('../services/training.service')
const { userExtractor } = require('../utils/middleware')

// get active training
trainingRouter.get('/', userExtractor, async (request, response) => {
  const activeTraining = await Training
    .findOne({ isActive: true })
    .populate('attendance', { name: 1, games_played: 1, paid: 1 })
    .populate('current_players')
    .populate('initialized_players')
    .populate('initializedTeam', { name: 1 })
    .populate('currentGameTeam', { name: 1 })
    .populate('team_a', { name: 1 })
    .populate('team_b', { name: 1 })

  if (!activeTraining) return response.status(200).json(null)
  response.json(activeTraining)
})

// create training
trainingRouter.post('/', userExtractor, async (request, response) => {
  const activeTraining = await Training.findOne({ isActive: true })
  if (activeTraining) return response.status(400).json({ error: 'training already exists' })

  const { startTime } = request.body || {}
  if (!startTime) return response.status(400).json({ error: 'startTime is required' })

  const newTraining = new Training({ startTime: new Date(startTime), isActive: true })
  const saved = await newTraining.save()
  response.status(201).json(saved)
})

// delete training
trainingRouter.delete('/', userExtractor, async (request, response) => {
  const activeTraining = await Training.findOne({ isActive: true })
  if (!activeTraining) return response.status(404).json({ error: 'No active training found.' })

  await Player.updateMany(
    { _id: { $in: activeTraining.attendance } },
    {
      $set: {
        games_played: 0,
        paid: false,
        late: false,
      }
    }
  )
  await Team.deleteMany({})
  await Training.findByIdAndDelete(activeTraining.id)
  return response.status(200).json({ isActive: false })
})

// initialize game — skill or team
trainingRouter.post('/initializeGame', userExtractor, async (request, response) => {
  const { skillGroup, teamA, teamB } = request.body || {}

  if (!skillGroup && !(teamA && teamB)) {
    return response.status(400).json({ error: 'skillGroup or team selection is required' })
  }

  if (teamA && teamB) {
    const players = await trainingService.getPlayersByTeams(teamA, teamB)
    return response.json(players)
  }

  const players = await trainingService.getPlayersBySkillGroup(skillGroup)
  return response.json(players)
})

// start game
trainingRouter.post('/startGame', userExtractor, async (request, response) => {
  const players = await trainingService.startGame()
  return response.json(players)
})

// replace player
trainingRouter.patch('/replacePlayer', userExtractor, async (request, response) => {
  const { outPlayerId, inPlayerId } = request.body
  if (!outPlayerId || !inPlayerId) {
    return response.status(400).json({ error: 'outPlayerId and inPlayerId are required' })
  }

  const activeTraining = await Training.findOne({ isActive: true })
  if (!activeTraining) return response.status(404).json({ error: 'No active training' })

  const index = activeTraining.initialized_players.findIndex(
    id => id.toString() === outPlayerId
  )
  if (index === -1) return response.status(404).json({ error: 'Player not in initialized list' })

  activeTraining.initialized_players[index] = inPlayerId
  await activeTraining.save()

  const updatedPlayers = await Player.find({ _id: { $in: activeTraining.initialized_players } })
  const byId = new Map(updatedPlayers.map(p => [p.id, p]))
  const ordered = activeTraining.initialized_players
    .map(id => byId.get(id.toString()))
    .filter(Boolean)

  return response.json(ordered)
})

module.exports = trainingRouter
