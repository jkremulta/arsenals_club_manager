import axios from './axiosInstance'

const baseUrl = '/api/players'

const authHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
})

const getPlayers = async (token) => {
  const { data } = await axios.get(baseUrl, authHeaders(token))
  return data
}

export default {
  get: getPlayers
}