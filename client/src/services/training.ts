import axios from './axiosInstance'

const baseUrl = '/api/training'

const authHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` }
})

const createTraining = async (startTime: string, token: string) => {
  const { data } = await axios.post(baseUrl, { startTime }, authHeaders(token))
  return data
}

const deleteTraining = async (token: string) => {
  const { data } = await axios.delete(baseUrl, authHeaders(token))
  return data
}

const getTraining = async (token: string) => {
  const { data } = await axios.get(baseUrl, authHeaders(token))
  return data
}

type SkillType = "beginner" | "intermediate" | "advanced"

const initializeGame = async (skillType: SkillType, token: string) => {
  const { data } = await axios.post(
    `${baseUrl}/initializeGame`,
    { skillGroup: skillType },
    authHeaders(token)
  )

  return data
}

const startGame = async (token: string) => {
  const { data } = await axios.post(
    `${baseUrl}/startGame`,
    {},
    authHeaders(token)
  )
  
  return data
}

const replacePlayer = async (outPlayerId: string, inPlayerId: string, token: string) => {
  const { data } = await axios.patch(
    `${baseUrl}/replacePlayer`,
    { outPlayerId, inPlayerId },
    authHeaders(token)
  )

  return data
}


export default {
  get: getTraining,
  post: createTraining,
  delete: deleteTraining,
  initializeGame,
  startGame,
  replacePlayer,
}
