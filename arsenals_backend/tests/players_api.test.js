const { test, after, beforeEach} = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')

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

test('get: returns all players', async () => {
  const response = await api
    .get('/api/players')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.length, helper.initialPlayers.length)
})

test('get: returns 401 without a token', async () => {
  await api
    .get('/api/players')
    .expect(401)
    .expect('Content-Type', /application\/json/)
})

test('post: creates a player and returns 201 with the saved data', async () => {
  const player = { 
    name: "Dummy Player", 
    age: 18, 
    gender: "M", 
    skill: "Intermediate", 
    rank: 6.5 
  }

  await api
    .post('/api/players')
    .set('Authorization', `Bearer ${token}`)
    .send(player)
    .expect(201)

  const currentPlayers = await helper.getAllPlayers()

  assert(currentPlayers.length === helper.initialPlayers.length + 1)
  assert(currentPlayers.some(p => p.name === player.name))
})

test('post: returns 401 without a token', async () => {
  const player = { 
    name: "Dummy Player", 
    age: 18, 
    gender: "M", 
    skill: "Intermediate", 
    rank: 6.5 
  }

  await api
    .post('/api/players')
    .send(player)
    .expect(401)
})

test('post: returns 400 when required field is missing', async () => {
  const player = { 
    name: "Dummy Player", 
    skill: "Intermediate", 
    rank: 6.5 
  }

  await api
    .post('/api/players')
    .set('Authorization', `Bearer ${token}`)
    .send(player)
    .expect(400)
})

test('delete: deletes a player and returns 204', async () => {
  const playersInDbBefore = await helper.getAllPlayers()

  await api
    .delete(`/api/players/${playersInDbBefore[0].id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)
  
  const playersInDbAfter = await helper.getAllPlayers()
  assert(!playersInDbAfter.some(p => p.id === playersInDbBefore[0].id))
})

test('delete: returns 204 for a non-existent id', async () => {
  await api
    .delete('/api/players/69b184808683c9c35a7e641d')
    .set('Authorization', `Bearer ${token}`)
    .expect(204)
})

test('delete: returns 401 without a token', async () => {
  const playersInDbBefore = await helper.getAllPlayers()

  await api
    .delete(`/api/players/${playersInDbBefore[0].id}`)
    .expect(401)
})

after(async () => {
  await mongoose.connection.close()
})