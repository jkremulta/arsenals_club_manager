import 'dotenv/config'

const PORT = process.env.PORT

const MONGODB_URI =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_MONGODB_URI
    : process.env.NODE_ENV === 'development'
      ? process.env.DEV_MONGODB_URI
      : process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error(
    `No MongoDB URI set for NODE_ENV="${process.env.NODE_ENV}". Check your .env file.`,
  )
}

export default { PORT, MONGODB_URI }