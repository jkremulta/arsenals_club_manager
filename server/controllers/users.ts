import bcrypt from 'bcrypt'
import User from '../models/user'
import { Router } from 'express'
const usersRouter = Router()


// zod parsing
import { z } from 'zod'
const userInput = z.object({
  username: z.string().min(3),
  password: z.string().min(3),
})

usersRouter.post('/', async (request, response) => {
  const { username, password } = userInput.parse(request.body)

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    passwordHash
  })

  const savedUser = await user.save()
  response.status(201).json(savedUser)
})

export default usersRouter