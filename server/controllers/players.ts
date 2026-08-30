import { Router } from 'express'
const playersRouter = Router()
import Player from '../models/players'
import { userExtractor } from '../utils/middleware'

// zod parsing
import { z } from 'zod'
const playerInput = z.object({
  name: z.string(),
  birthday: z.coerce.date(),
  gender: z.string(),
  skill: z.enum(['beginner', 'intermediate', 'advanced']),
  rank: z.coerce.number(),
})

playersRouter.get('/', userExtractor, async (_request, response) => {
  const players = await Player.find({})

  response.json(players)
})

playersRouter.post('/', userExtractor, async (request, response) => {
  const { name, birthday, gender, skill, rank } = playerInput.parse(request.body)

  const newPlayer = new Player({
    name,
    birthday,
    gender,
    skill,
    rank,
  })

  const savedPlayer = await newPlayer.save()
  response.status(201).json(savedPlayer)
})

playersRouter.put('/:id', userExtractor, async (request, response) => {
  const { id } = request.params
  const { name, birthday, gender, skill, rank } = playerInput.parse(request.body)

  const updatedPlayer = await Player.findByIdAndUpdate(
    id,
    {
      name,
      birthday,
      gender,
      skill,
      rank,
    },
    {
      returnDocument: 'after',
      runValidators: true,
      context: 'query',
    },
  )

  if (!updatedPlayer) {
    return response.status(404).json({ error: 'player not found' })
  }

  response.json(updatedPlayer)
})

playersRouter.delete('/:id', userExtractor, async (request, response) => {
  const { id } = request.params

  const player = await Player.findById(id)

  if (!player) {
    return response.status(404).json({ error: 'Player not found' })
  }

  await Player.findByIdAndDelete(id)
  return response.status(200).json({
    deletedPlayer: player.name,
  })
})

export default playersRouter
