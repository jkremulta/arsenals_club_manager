const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')

const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

let token

beforeEach(async () => {
  await helper.clearDb()
  await helper.initializeDb()
  token = await helper.loginAndGetToken()
})

test('post: returns 400 when password is shorter than 3 characters', async () => {
  const user = {
    username: 'testuser',
    password: 'te'
  }

  await api
    .post('/api/users')
    .set('Authorization', `Bearer ${token}`)
    .send(user)
    .expect(400)
})

test('post: successfully creates a user and returns 201', async () => {
  const user = {
    username: 'dummyuser',
    password: 'testpassword'
  }

  await api
    .post('/api/users')
    .set('Authorization', `Bearer ${token}`)
    .send(user)
    .expect(201)
})

test('post: does not return the passwordHash in the response', async () => {
  const user = {
    username: 'dummyuser',
    password: 'testpassword'
  }

  const response = await api
    .post('/api/users')
    .set('Authorization', `Bearer ${token}`)
    .send(user)
    .expect(201)

  assert.strictEqual(response.passwordHash, undefined)
})

test('duplicate username fails', async () => {
  // this user already exists from test_helper.js
  const user = {
    username: 'testuser',
    password: 'testpassword'
  }

  await api
    .post('/api/users')
    .set('Authorization', `Bearer ${token}`)
    .send(user)
    .expect(400)
})

after(async () => {
  await mongoose.connection.close()
})