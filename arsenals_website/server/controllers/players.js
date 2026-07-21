const playersRouter = require('express').Router()
const Player = require('../models/players')
const { userExtractor } = require('../utils/middleware')

playersRouter.get('/', userExtractor, async (request, response) => {
  const players = await Player.find({})
  
  response.json(players)
})

playersRouter.post('/', userExtractor, async (request, response) => {
  const { name, birthday, gender, skill, rank } = request.body

  const newPlayer = new Player({
    name,
    birthday,
    gender,
    skill, 
    rank
  })

  const savedPlayer = await newPlayer.save()
  response.status(201).json(savedPlayer)
})

playersRouter.put('/:id', userExtractor, async (request, response) => {
  const { id } = request.params
  const { name, birthday, gender, skill, rank } = request.body

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
    }
  )

  if (!updatedPlayer) {
    return response.status(404).json({ error: 'player not found' })
  }

  response.json(updatedPlayer)
})

playersRouter.delete('/:id', userExtractor, async (request, response) => {
  const { id } = request.params
  
  await Player.findByIdAndDelete(id)
  response.status(204).end()
})

module.exports = playersRouter
