const Player = require('../models/players')
const Training = require('../models/training')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const initialPlayers = [
  { name: "Juan Dela Cruz", age: 20, gender: "M", skill: "Intermediate", rank: 7 },
  { name: "Miguel Santos", age: 22, gender: "M", skill: "Advanced", rank: 9 },
  { name: "Carlo Reyes", age: 19, gender: "M", skill: "Beginner", rank: 3 },
  { name: "Paolo Navarro", age: 21, gender: "M", skill: "Intermediate", rank: 6 },
  { name: "Angela Cruz", age: 20, gender: "F", skill: "Advanced", rank: 8 },
  { name: "Sofia Garcia", age: 23, gender: "F", skill: "Intermediate", rank: 7 },
  { name: "Daniel Flores", age: 24, gender: "M", skill: "Advanced", rank: 8.5 },
  { name: "Carla Mendoza", age: 21, gender: "F", skill: "Beginner", rank: 3.5 },
  { name: "Rafael Castillo", age: 20, gender: "M", skill: "Intermediate", rank: 6.5 },
  { name: "Lucia Ramos", age: 22, gender: "F", skill: "Advanced", rank: 8 },
  { name: "Paolo Santos", age: 19, gender: "M", skill: "Beginner", rank: 2.5 },
  { name: "Mia Lopez", age: 20, gender: "F", skill: "Intermediate", rank: 7 },
  { name: "Carlos Rivera", age: 23, gender: "M", skill: "Advanced", rank: 9 },
  { name: "Isabel Cruz", age: 21, gender: "F", skill: "Intermediate", rank: 7.5 }
]

const initializeDb = async ({ withAttendance = true } = {}) => {
  const playersInDb = await Player.insertMany(initialPlayers)
  const playerIds = playersInDb.map(p => p._id)

  // initialize training
  const training = new Training({
    startTime: new Date(),
    isActive: true,
    attendance: withAttendance ? playerIds : []
  })
  
  await training.save()

  // create user
  const passwordHash = await bcrypt.hash('testpassword', 10)
    
  const user = new User({
    username: 'testuser',
    passwordHash
  })

  await user.save()
}

const loginAndGetToken = async () => {
  const response = await api
    .post('/api/login')
    .send({
      username: 'testuser',
      password: 'testpassword'
    })

  return response.body.token
}

const getAllPlayers = async () => {
  const players = await Player.find({})
  return players.map(p => p.toJSON())
}

const clearDb = async () => {
  await User.deleteMany()
  await Player.deleteMany()
  await Training.deleteMany()
}


module.exports = {
  initialPlayers,
  initializeDb,
  loginAndGetToken,
  getAllPlayers,
  clearDb
}