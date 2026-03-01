const express = require('express')
const mongoose = require('mongoose')
const playersRouter = require('./controllers/players')
const trainingRouter = require('./controllers/training')
const attendanceRouter = require('./controllers/attendance')
const logger = require('./utils/logger')
const config = require('./utils/config')
const middleware = require('./utils/middleware')

const app = express()

logger.info('connecting to', config.MONGODB_URI)
mongoose
  .connect(config.MONGODB_URI, { family: 4 })
  .then(() => logger.info('connected to MongoDB'))
  .catch(error => logger.error('error connecting to MongoDB', error.message))

app.use(express.json())
app.use('/api/players', playersRouter)
app.use('/api/training', trainingRouter)
app.use('/api/attendance', attendanceRouter)

app.use(middleware.errorHandler)
app.use(middleware.unknownEndpoint)

module.exports = app