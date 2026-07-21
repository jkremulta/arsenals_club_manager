import axios from './axiosInstance'

const baseUrl = '/api/players'

const authHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
})

const getPlayers = async (token) => {
  const { data } = await axios.get(baseUrl, authHeaders(token))
  return data
}

const createPlayer = async (player, token) => {
  const { data } = await axios.post(baseUrl, player, authHeaders(token))
  return data
}

const updatePlayer = async (id, player, token) => {
  const { data } = await axios.put(`${baseUrl}/${id}`, player, authHeaders(token))
  return data
}

const deletePlayer = async (id, token) => {
  const { data } = await axios.delete(`${baseUrl}/${id}`, authHeaders(token))
  return data
}

export default {
  get: getPlayers,
  post: createPlayer,
  put: updatePlayer,
  delete: deletePlayer
}
