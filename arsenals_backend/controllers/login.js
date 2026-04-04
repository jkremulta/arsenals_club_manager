const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')
const { userExtractor } = require('../utils/middleware')

// login user
loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body
  
  const user = await User.findOne({ username })
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)
  
  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  const userForToken = {
    username: user.username,
    id: user._id
  }

  const token = jwt.sign(
    userForToken,
    process.env.SECRET,
    { expiresIn: '6h' }
  )

  response.status(200).send({ token, username })
})

loginRouter.post('/verify-password', userExtractor, async (request, response) => {
  const { password } = request.body || {}

  const passwordCorrect = request.user === null
    ? false
    : await bcrypt.compare(password || '', request.user.passwordHash)

  if (!passwordCorrect) {
    return response.status(403).json({ error: 'incorrect password' })
  }

  response.status(200).json({ ok: true })
})

module.exports = loginRouter
