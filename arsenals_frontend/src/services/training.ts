import axios from './axiosInstance'

const baseUrl = '/api/training'

const authHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
})

const createTraining = async (startTime, token) => {
  const { data } = await axios.post(baseUrl, { startTime }, authHeaders(token))
  return data
}

const deleteTraining = async (token) => {
  const { data } = await axios.delete(baseUrl, authHeaders(token))
  return data
}

const getTraining = async (token) => {
  const { data } = await axios.get(baseUrl, authHeaders(token))
  return data
}

const initializeGame = async (payload, token) => {
  const { data } = await axios.post(
    `${baseUrl}/initializeGame`,
    payload,
    authHeaders(token)
  )

  return data
}

const startGame = async (token) => {
  const { data } = await axios.post(
    `${baseUrl}/startGame`,
    {},
    authHeaders(token)
  )
  
  return data
}

const replacePlayer = async (outPlayerId, inPlayerId, token) => {
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
