import axios from './axiosInstance'
import type { Skill } from '../../../shared/types/player'
import type { Training } from '../../../shared/types/training'
import type { Player } from '../../../shared/types/player'

const baseUrl = '/api/training'

const authHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` }
})

interface PopulatedTraining extends Omit<Training, 'attendance' | 'current_players' | 'initialized_players'> {
  attendance: Pick<Player, 'id' | 'name' | 'games_played' | 'paid'>[]
  current_players: Player[]
  initialized_players: Player[]
}

interface ReplacePlayerResult {
  ordered: Player[]
  replacedPlayer: string
  replacementPlayer: string
}

const createTraining = async (startTime: string, token: string): Promise<Training> => {
  const { data } = await axios.post<Training>(baseUrl, { startTime }, authHeaders(token))
  return data
}

const deleteTraining = async (token: string): Promise<{ isActive: false }> => {
  const { data } = await axios.delete<{ isActive: false }>(baseUrl, authHeaders(token))
  return data
}

const getTraining = async (token: string): Promise<PopulatedTraining | null> => {
  const { data } = await axios.get<PopulatedTraining | null>(baseUrl, authHeaders(token))
  return data
}

const initializeGame = async (skillType: Skill, token: string): Promise<Player[]> => {
  const { data } = await axios.post<Player[]>(
    `${baseUrl}/initializeGame`,
    { skillGroup: skillType },
    authHeaders(token)
  )
  return data
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