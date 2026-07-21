const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const User = require('../models/user')

const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

beforeEach(async () => {
  await helper.clearDb()
  await helper.initializeDb()
})

test('post: returns 401 for a non-existing username', async () => {
  const user = {
    username: 'falseuser',
    password: 'falsepassword'
  }

  await api
    .post('/api/login')
    .send(user)
    .expect(401)
})

test('post: returns 401 for a wrong password', async () => {
  const user = {
    username: 'testuser',
    password: 'falsepassword'
  }


  await api
    .post('/api/login')
    .send(user)
    .expect(401)
})

test('post: returns 200 with a token on a valid credential', async () => {
  const user = {
    username: 'testuser',
    password: 'testpassword'
  }

  const response = await api
    .post('/api/login')
    .send(user)
    .expect(200)

  assert.ok(response.body.token)
})

test('post: returned token should be a valid JWT', async () => {
   const user = {
    username: 'testuser',
    password: 'testpassword'
  }

  const response = await api
    .post('/api/login')
    .send(user)
    .expect(200)
  
  const decodedToken = jwt.verify(response.body.token, process.env.SECRET)
  const decodedUser = await User.findById(decodedToken.id)

  assert.strictEqual(decodedUser.username, user.username)
})


after(async () => {
  await mongoose.connection.close()
})