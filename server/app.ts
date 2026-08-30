import path from 'path'
import express from 'express'
import mongoose from 'mongoose'

import attendanceRouter from './controllers/attendance'
import loginRouter from './controllers/login'
import playersRouter from './controllers/players'
import trainingRouter from './controllers/training'
// import usersRouter from './controllers/users'

import logger from './utils/logger'
import config from './utils/config'
import { unknownEndpoint, errorHandler, tokenExtractor } from './utils/middleware'
const app = express()


logger.info('connecting to', config.MONGODB_URI)
mongoose
  .connect(config.MONGODB_URI, { family: 4 })
  .then(() => logger.info('connected to MongoDB'))
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error)
    logger.error('error connecting to MongoDB', message)
  })

app.use(express.json())
app.use(tokenExtractor)

app.use('/api/attendance', attendanceRouter)
app.use('/api/login', loginRouter)
app.use('/api/players', playersRouter)
app.use('/api/training', trainingRouter)
// disable register
// app.use('/api/users', usersRouter)

const clientDistPath = path.join(__dirname, '../../../client/dist')

app.use(express.static(clientDistPath))

app.get('/{*any}', (request, response, next) => {
  if (request.path.startsWith('/api/')) {
    return next()
  }

  response.sendFile(path.join(clientDistPath, 'index.html'))
})
app.use(errorHandler)
app.use(unknownEndpoint)

export default app
