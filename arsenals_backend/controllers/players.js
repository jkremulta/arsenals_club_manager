const playersRouter = require('express').Router()
const Player = require('../models/players')

playersRouter.get('/', async (request, response) => {
  const players = await Player
    .find({})
  
  response.json(players)
})

playersRouter.post('/', async (request, response) => {
  const { name, age, gender, skill, rank } = request.body

  const newPlayer = new Player({
    name,
    age,
    gender,
    skill, 
    rank
  })

  const savedPlayer = await newPlayer.save()
  response.status(201).json(savedPlayer)
})

playersRouter.delete('/:id', async (request, response) => {
  const { id } = request.params
  
  await Player.findByIdAndDelete(id)
  response.status(204).end()
})

module.exports = playersRouter