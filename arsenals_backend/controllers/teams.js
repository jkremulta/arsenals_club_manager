const teamsRouter = require('express').Router()
const Team = require('../models/team')
const { userExtractor } = require('../utils/middleware')

// get all teams with populated players
teamsRouter.get('/', userExtractor, async (request, response) => {
  const teams = await Team.find({}).populate('players', {
    name: 1, skill: 1, rank: 1, games_played: 1, gender: 1
  })
  response.json(teams)
})

// create team
teamsRouter.post('/', userExtractor, async (request, response) => {
  const { name } = request.body
  if (!name) return response.status(400).json({ error: 'Team name is required' })

  const existing = await Team.findOne({ name })
  if (existing) return response.status(400).json({ error: 'Team name already exists' })

  const team = new Team({ name, players: [] })
  const saved = await team.save()
  response.status(201).json(saved)
})

// delete team
teamsRouter.delete('/:id', userExtractor, async (request, response) => {
  const { id } = request.params
  await Team.findByIdAndDelete(id)
  response.status(204).end()
})

// rename team
teamsRouter.patch('/:id', userExtractor, async (request, response) => {
  const { id } = request.params
  const { name } = request.body
  if (!name) return response.status(400).json({ error: 'Team name is required' })

  const updated = await Team.findByIdAndUpdate(
    id,
    { name },
    { new: true }
  ).populate('players', { name: 1, skill: 1, rank: 1, games_played: 1, gender: 1 })

  if (!updated) return response.status(404).json({ error: 'Team not found' })
  response.json(updated)
})

// add player to team
teamsRouter.post('/:id/players', userExtractor, async (request, response) => {
  const { id } = request.params
  const { playerId } = request.body
  if (!playerId) return response.status(400).json({ error: 'playerId is required' })

  const team = await Team.findById(id)
  if (!team) return response.status(404).json({ error: 'Team not found' })

  if (team.players.map(p => p.toString()).includes(playerId)) {
    return response.status(400).json({ error: 'Player already in team' })
  }

  team.players.push(playerId)
  await team.save()

  const populated = await Team.findById(id).populate('players', {
    name: 1, skill: 1, rank: 1, games_played: 1, gender: 1
  })
  response.json(populated)
})

// remove player from team
teamsRouter.delete('/:id/players/:playerId', userExtractor, async (request, response) => {
  const { id, playerId } = request.params

  const team = await Team.findById(id)
  if (!team) return response.status(404).json({ error: 'Team not found' })

  team.players = team.players.filter(p => p.toString() !== playerId)
  await team.save()

  const populated = await Team.findById(id).populate('players', {
    name: 1, skill: 1, rank: 1, games_played: 1, gender: 1
  })
  response.json(populated)
})

module.exports = teamsRouter
