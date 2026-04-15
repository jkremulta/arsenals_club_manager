import axios from './axiosInstance'

const baseUrl = '/api/teams'
const authHeaders = (token) => ({ headers: { Authorization: `Bearer ${token}` } })

const getTeams = async (token) => {
  const { data } = await axios.get(baseUrl, authHeaders(token))
  return data
}

const createTeams = async (name, token) => {
  const { data } = await axios.post(baseUrl, { name }, authHeaders(token))
  return data
}

const removeTeams = async (id, token) => {
  await axios.delete(`${baseUrl}/${id}`, authHeaders(token))
}

const renameTeams = async (id, name, token) => {
  const { data } = await axios.patch(`${baseUrl}/${id}`, { name }, authHeaders(token))
  return data
}

const addPlayer = async (teamId, playerId, token) => {
  const { data } = await axios.post(`${baseUrl}/${teamId}/players`, { playerId }, authHeaders(token))
  return data
}

const removePlayer = async (teamId, playerId, token) => {
  const { data } = await axios.delete(`${baseUrl}/${teamId}/players/${playerId}`, authHeaders(token))
  return data
}

export default { 
  get: getTeams,
  create: createTeams, 
  remove: removeTeams, 
  rename: renameTeams, 
  addPlayer, 
  removePlayer 
}