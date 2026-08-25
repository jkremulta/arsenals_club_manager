import { Router, Request, Response } from 'express'
import Training from '../models/training'
import Player from '../models/players'
import trainingService from '../services/training.service'
import { userExtractor } from '../utils/middleware'
import { z } from 'zod'

const trainingRouter = Router()

trainingRouter.get('/', userExtractor, async (_request, response) => {
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
const initializeGameSchema = z.object({
  skillGroup: z.enum(['beginner', 'intermediate', 'advanced']),
})

trainingRouter.post(
  '/initializeGame',
  userExtractor,
  async (request, response) => {
    const parsed = initializeGameSchema.safeParse(request.body)
    if (!parsed.success) {
      return response.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid request.' })
    }

    const { skillGroup } = parsed.data

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

    const result = await trainingService.replacePlayer(outPlayerId, inPlayerId)

    return response.json({
      ordered: result.ordered,
      replacedPlayer: result.outPlayer.name,
      replacementPlayer: result.inPlayer.name,
    })
  },
)

export default trainingRouter
