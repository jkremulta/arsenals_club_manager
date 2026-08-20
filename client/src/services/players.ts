import axios from './axiosInstance'
import type { Players } from './attendance'

const baseUrl = '/api/players'

const authHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` }
})

const getPlayers = async (token: string): Promise<Players[]> => {
  const { data } = await axios.get(baseUrl, authHeaders(token))
  return data
}

export interface PlayerType {
  name: string
  rank: number
  gender: string
  birthday: string
}

const createPlayer = async (player: PlayerType, token: string): Promise<Players> => {
  const { data } = await axios.post(baseUrl, player, authHeaders(token))
  return data
}

const updatePlayer = async (id: string, player: PlayerType, token: string): Promise<Players> => {
  const { data } = await axios.put(`${baseUrl}/${id}`, player, authHeaders(token))
  return data
}

interface DeletedPlayerType {
  deletedPlayer: string
}

const deletePlayer = async (id: string, token: string): Promise<DeletedPlayerType> => {
  const { data } = await axios.delete(`${baseUrl}/${id}`, authHeaders(token))
  return data
}

export default {
  get: getPlayers,
  post: createPlayer,
  put: updatePlayer,
  delete: deletePlayer
}
