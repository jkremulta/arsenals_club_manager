import { Router } from 'express'
const trainingRouter = Router()
import Training from '../models/training'
import Player from '../models/players'
import trainingService from '../services/training.service'
import { userExtractor } from '../utils/middleware'
import type { Request, Response } from 'express'
import { Types } from 'mongoose'

trainingRouter.get('/', userExtractor, async (request, response) => {
  const activeTraining = await Training.findOne({ isActive: true })
    .populate('attendance', { name: 1, games_played: 1, paid: 1 })
    .populate('current_players')
    .populate('initialized_players')

  if (!activeTraining) return response.status(200).json(null)
  response.json(activeTraining)
})


interface CreateTrainingBody {
  startTime: string;
}

trainingRouter.post(
  '/',
  userExtractor,
  async (
    request: Request<unknown, unknown, CreateTrainingBody>,
    response: Response
  ) => {
    const activeTraining = await Training.findOne({ isActive: true })

    if (activeTraining)
      return response.status(400).json({ error: 'Training already exists.' })

    const { startTime } = request.body

    if (!startTime)
      return response.status(400).json({ error: 'Start time is required.' })

    const newTraining = new Training({
      startTime: new Date(startTime),
      isActive: true,
    })

    const saved = await newTraining.save()
    response.status(201).json(saved)
  }
)

// delete training
trainingRouter.delete('/', userExtractor, async (_request, response) => {
  const activeTraining = await Training.findOne({ isActive: true })
  if (!activeTraining)
    return response.status(404).json({ error: 'No active training found.' })

  await Player.updateMany(
    {},
    {
      $set: {
        games_played: 0,
        paid: false,
        late: false,
      },
    },
  )

  await Training.findByIdAndDelete(activeTraining.id)

  return response.status(200).json({ isActive: false })
})

// initialize game

interface InitializeGameBody {
  skillGroup: string;
}

trainingRouter.post(
  '/initializeGame',
  userExtractor,
  async (request: Request <unknown, unknown, InitializeGameBody>, response: Response) => {
    const { skillGroup } = request.body

    if (!skillGroup) {
      return response.status(400).json({ error: 'Skill Group is required.' })
    }

    const players = await trainingService.getPlayersBySkillGroup(skillGroup)

    return response.json(players)
  },
)

// start game
trainingRouter.post('/startGame', userExtractor, async (_request, response) => {
  const players = await trainingService.startGame()

  return response.json(players)
})

interface ReplacePlayerBody {
  outPlayerId: string;
  inPlayerId: string;
}

trainingRouter.patch(
  '/replacePlayer',
  userExtractor,
  async (request: Request<unknown, unknown, ReplacePlayerBody>, response: Response) => {
    const { outPlayerId, inPlayerId } = request.body

    if (!outPlayerId || !inPlayerId) {
      return response
        .status(400)
        .json({ error: 'outPlayerId and inPlayerId are required' })
    }

    // include in the return the outPlayer and inPlayer
    const outPlayer = await Player.findById(outPlayerId)
    const inPlayer = await Player.findById(inPlayerId)

    if (!outPlayer || !inPlayer) {
      return response.status(404).json({ error: 'Player not found.' })
    }

    const activeTraining = await Training.findOne({ isActive: true })
    if (!activeTraining)
      return response.status(404).json({ error: 'No active training.' })

    const index = activeTraining.initialized_players.findIndex(
      (id) => id?.toString() === outPlayerId, // <- fixed
    )
    if (index === -1)
      return response
        .status(404)
        .json({ error: 'Player not in initialized list.' })

    activeTraining.initialized_players[index] = new Types.ObjectId(inPlayerId)
    await activeTraining.save()

    // this code makes it so the list doesn't reshuffle after being replace
    const updatedPlayers = await Player.find({
      _id: { $in: activeTraining.initialized_players },
    }) // <- removed duplicate
    const byId = new Map(updatedPlayers.map((p) => [p.id, p]))
    const ordered = activeTraining.initialized_players
      .filter(Boolean)
      .map((id) => byId.get(id.toString()))
      .filter(Boolean)

    return response.json({
      ordered,
      replacedPlayer: outPlayer.name,
      replacementPlayer: inPlayer.name,
    })
  },
)

export default trainingRouter
