const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')

const Training = require('../models/training')

const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

let token

beforeEach(async () => {
  await helper.clearDb()
  await helper.initializeDb({ withAttendance: true })
  token = await helper.loginAndGetToken()
})

test.only('get: returns 404 when no active training exists', async () => {
  await Training.deleteMany()

  await api
    .get('/api/training')
    .set('Authorization', `Bearer ${token}`)
    .expect(404)
    .expect('Content-Type', /application\/json/)
})

test.only('get: returns the active training with populated fields', async () => {
  const response = await api
    .get('/api/training')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert(response.body.attendance.length === helper.initialPlayers.length)
})

test.only('get: returns 401 without a token', async () => {
  await api
    .get('/api/training')
    .expect(401)
    .expect('Content-Type', /application\/json/)
})

test.only('post: returns 400 when an active training already exists', async () => {
  const training = {
    startTime: new Date()
  }

  await api
    .post('/api/training')
    .set('Authorization', `Bearer ${token}`)
    .send(training)
    .expect(400)
})

test.only('post: returns 400 when startTime is missing', async () => {
  await Training.deleteMany()
  
  const training = {
    startTime: null
  }

  await api
    .post('/api/training')
    .set('Authorization', `Bearer ${token}`)
    .send(training)
    .expect(400)
})

test.only('post: creates a training and returns 201', async () => {
  await Training.deleteMany()

  const training = {
    startTime: new Date()
  }

  await api
    .post('/api/training')
    .set('Authorization', `Bearer ${token}`)
    .send(training)
    .expect(201)
})

test.only('delete: returns 404 when no active training exists', async () => {
  await Training.deleteMany()

  await api
    .delete('/api/training')
    .set('Authorization', `Bearer ${token}`)
    .expect(404)
})

test.only('delete: deletes the training and resets the games_played to 0 for players, returns 200', async () => {
  await api
    .delete('/api/training')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)

  const playersInDb = await helper.getAllPlayers()
  assert(playersInDb.every(p => p.games_played === 0))
})

test.only('delete: returns 401 without a token', async () => {
  await api
    .delete('/api/training')
    .expect(401)
})


after(async () => {
  await mongoose.connection.close()
})