const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')

const Player = require('../models/players')
const Training = require('../models/training')
const User = require('../models/user')

const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

describe('with empty attendance', () => {

  beforeEach(async () => {
    await helper.clearDb()
    await helper.initializeDb({ withAttendance: false })
  })

  test('get: returns 401 without a valid token', async () => {
    await api
      .get('/api/attendance')
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })

  test('get: returns 404 when no active training with token', async () => {
    await Training.deleteMany()
    const token = await helper.loginAndGetToken()

    await api
      .get('/api/attendance')
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
      .expect('Content-Type', /application\/json/)
  })

  test('post: returns 400 when id is missing from the body', async () => {
    await api
      .post('/api/attendance')
      .send({})
      .expect(400)
  })

  test('post: returns 400 when no active training exists', async () => {
    await Training.deleteMany()
    const players = await helper.getAllPlayers()

    await api
      .post('/api/attendance')
      .send({
        "id": players[0].id
      })
      .expect(400)
  })

  test('post: successfully adds a player and returns 201', async () => {
    const players = await helper.getAllPlayers()

    await api
      .post('/api/attendance')
      .send({ "id": players[0].id })
      .expect(201)
    
    const training = await Training.findOne({ isActive: true })
    assert(training.attendance.includes(players[0].id))
  })

})


describe('with full attendance', () => {

  beforeEach(async () => {
    await helper.clearDb()
    await helper.initializeDb({ withAttendance: true })
  })

  test('get: returns the attendance list when active training exists', async () => {
    const token = await helper.loginAndGetToken()

    const response = await api
      .get('/api/attendance')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.length, helper.initialPlayers.length)
  })

  test('post: returns 400 when player is already in attendance', async () => {
  const players = await helper.getAllPlayers()

  await api
    .post('/api/attendance')
    .send({
      "id": players[0].id
    })
    .expect(400)
  })

  test('delete: returns 401 without a valid token', async () => {
    await Training.deleteMany()
    const players = await helper.getAllPlayers()
    
    await api
      .delete(`/api/attendance/${players[0].id}`)
      .expect(401)
  })

  test('delete: returns 404 when no active training exists', async () => {
    await Training.deleteMany()
    const players = await helper.getAllPlayers()
    const token = await helper.loginAndGetToken()
    
    await api
      .delete(`/api/attendance/${players[0].id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
  })

  test('delete: returns 404 when the player is not in attendance', async () => {
    const token = await helper.loginAndGetToken()

    await api
      .delete(`/api/attendance/69b184808683c9c35a7e641d`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
  })

  test('delete: successfuly removes a player and returns 204', async () => {
    const token = await helper.loginAndGetToken()
    const players = await helper.getAllPlayers()

    await api
      .delete(`/api/attendance/${players[0].id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const training = await Training.findOne({ isActive: true })
    assert(!training.attendance.includes(players[0].id))
  })
  
})

after(async () => {
  await mongoose.connection.close()
})