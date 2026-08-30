import axios from './axiosInstance'
import type { Skill } from '../../../shared/types/player'
import type { Training } from '../../../shared/types/training'
import type { Player } from '../../../shared/types/player'

const baseUrl = '/api/training'

const authHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` }
})

interface PopulatedTraining extends Omit<Training, 'current_players' | 'initialized_players'> {
  current_players: Player[]
  initialized_players: Player[]
}

interface ReplacePlayerResult {
  replacedPlayer: string
  replacementPlayer: string
}

const createTraining = async (startTime: string, token: string): Promise<void> => {
  await axios.post(baseUrl, { startTime }, authHeaders(token))
}

const deleteTraining = async (token: string): Promise<void> => {
  await axios.delete(baseUrl, authHeaders(token))
}

const getTraining = async (token: string): Promise<PopulatedTraining | null> => {
  const { data } = await axios.get<PopulatedTraining | null>(baseUrl, authHeaders(token))
  return data
}

const initializeGame = async (skillType: Skill, token: string): Promise<void> => {
  await axios.post(`${baseUrl}/initializeGame`, { skillGroup: skillType }, authHeaders(token))
}

const startGame = async (token: string): Promise<Player[]> => {
  const { data } = await axios.post<Player[]>(`${baseUrl}/startGame`, {}, authHeaders(token))
  return data
}

const replacePlayer = async (
  outPlayerId: string,
  inPlayerId: string,
  token: string
): Promise<ReplacePlayerResult> => {
  const { data } = await axios.patch<ReplacePlayerResult>(
    `${baseUrl}/replacePlayer`,
    { outPlayerId, inPlayerId },
    authHeaders(token)
  )
  return data
}

export const trainingApi = {
  createTraining,
  deleteTraining,
  getTraining,
  initializeGame,
  startGame,
  replacePlayer,
}