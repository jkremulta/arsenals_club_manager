import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import User from '../models/user'
import type { Request, Response } from 'express'
import { Router } from 'express'
const loginRouter = Router()

interface LoginRequestBody {
  username: string;
  password: string;
}

loginRouter.post(
  '/',
  async (
    request: Request<unknown, unknown, LoginRequestBody>,
    response: Response,
  ) => {
    const username = request.body.username.toLowerCase()
    const password = request.body.password

    const user = await User.findOne({ username })

    const passwordCorrect =
      user === null ? false : await bcrypt.compare(password, user.passwordHash)

    if (!(user && passwordCorrect)) {
      return response.status(401).json({
        error: 'Invalid username or password.',
      })
    }

    if (!process.env.SECRET) {
      throw new Error('SECRET environment variable is not set')
    }

    const userForToken = {
      username: user.username,
      id: user._id,
    }

    const token = jwt.sign(userForToken, process.env.SECRET, {
      expiresIn: '6h',
    })

    response.status(200).send({ token, username })
  },
)

export default loginRouter
