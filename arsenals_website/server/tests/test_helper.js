const Player = require('../models/players')
const Training = require('../models/training')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const initialPlayers = [
  { name: "Juan Dela Cruz", birthday: "2004-01-14", gender: "M", skill: "Intermediate", rank: 7 },
  { name: "Miguel Santos", birthday: "2002-06-02", gender: "M", skill: "Advanced", rank: 9 },
  { name: "Carlo Reyes", birthday: "2005-03-10", gender: "M", skill: "Beginner", rank: 3 },
  { name: "Paolo Navarro", birthday: "2003-09-19", gender: "M", skill: "Intermediate", rank: 6 },
  { name: "Angela Cruz", birthday: "2004-05-27", gender: "F", skill: "Advanced", rank: 8 },
  { name: "Sofia Garcia", birthday: "2001-11-08", gender: "F", skill: "Intermediate", rank: 7 },
  { name: "Daniel Flores", birthday: "2000-07-12", gender: "M", skill: "Advanced", rank: 8.5 },
  { name: "Carla Mendoza", birthday: "2003-02-21", gender: "F", skill: "Beginner", rank: 3.5 },
  { name: "Rafael Castillo", birthday: "2004-10-16", gender: "M", skill: "Intermediate", rank: 6.5 },
  { name: "Lucia Ramos", birthday: "2002-04-05", gender: "F", skill: "Advanced", rank: 8 },
  { name: "Paolo Santos", birthday: "2005-12-01", gender: "M", skill: "Beginner", rank: 2.5 },
  { name: "Mia Lopez", birthday: "2004-08-23", gender: "F", skill: "Intermediate", rank: 7 },
  { name: "Carlos Rivera", birthday: "2001-01-30", gender: "M", skill: "Advanced", rank: 9 },
  { name: "Isabel Cruz", birthday: "2003-06-14", gender: "F", skill: "Intermediate", rank: 7.5 }
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
