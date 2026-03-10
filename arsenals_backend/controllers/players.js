const playersRouter = require('express').Router()
const Player = require('../models/players')
const { userExtractor } = require('../utils/middleware')


// get all players in db
playersRouter.get('/', userExtractor, async (request, response) => {
  const players = await Player
    .find({})
  
  response.json(players)
})

playersRouter.post('/', userExtractor, async (request, response) => {
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

playersRouter.delete('/:id', userExtractor, async (request, response) => {
  const { id } = request.params
  
  await Player.findByIdAndDelete(id)
  response.status(204).end()
})

module.exports = playersRouter