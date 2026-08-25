import axios from './axiosInstance'
import type { CreatePlayer, Player } from '../../../shared/types/player'

const baseUrl = '/api/players'

const authHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` }
})

interface DeletedPlayerResponse {
  deletedPlayer: string
}

const getPlayers = async (token: string): Promise<Player[]> => {
  const { data } = await axios.get<Player[]>(baseUrl, authHeaders(token))
  return data
}

const createPlayer = async (player: CreatePlayer, token: string): Promise<Player> => {
  const { data } = await axios.post<Player>(baseUrl, player, authHeaders(token))
  return data
}

const updatePlayer = async (id: string, player: CreatePlayer, token: string): Promise<Player> => {
  const { data } = await axios.put<Player>(`${baseUrl}/${id}`, player, authHeaders(token))
  return data
}

const deletePlayer = async (id: string, token: string): Promise<DeletedPlayerResponse> => {
  const { data } = await axios.delete<DeletedPlayerResponse>(`${baseUrl}/${id}`, authHeaders(token))
  return data
}

export const playersApi = {
  getPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
}