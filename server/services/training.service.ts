import Training from '../models/training'
import Player from '../models/players'
import type { PlayerDocument } from '../models/players'
import type { Skill } from '../../shared/types/player'
import { Types } from 'mongoose'

// helper
const sortAndSlice = (players: PlayerDocument[], desc = true, amount = 0): PlayerDocument[] => {
  return players
    .sort((a, b) => (desc ? b.rank - a.rank : a.rank - b.rank))
    .slice(0, amount)
}

const sortByGamesPlayed = (players: PlayerDocument[]): PlayerDocument[] => {
  return [...players].sort((a, b) => {
    const byGames = (a.games_played ?? 0) - (b.games_played ?? 0)
    return byGames !== 0 ? byGames : (a.name ?? '').localeCompare(b.name ?? '')
  })
}

const sortPlayersBasedOnSkillGroup = (
  skillGroup: Skill,
  group: PlayerDocument[],
  attendance: PlayerDocument[],
) => {
  const groupIds = new Set(group.map((p) => p._id.toString()))
  const amountToFill = 14 - group.length
  const otherPlayers = attendance.filter(
    (player) =>
      player.skill !== skillGroup && !groupIds.has(player._id.toString()),
  )

  let playersToAdd: PlayerDocument[] = []

  if (skillGroup === 'advanced') {
    playersToAdd = sortAndSlice(otherPlayers, true, amountToFill)
  } else if (skillGroup === 'beginner') {
    playersToAdd = sortAndSlice(otherPlayers, false, amountToFill)
  } else if (skillGroup === 'intermediate') {
    const avgRank = group.length
      ? group.reduce((acc, curr) => acc + curr.rank, 0) / group.length
      : 0
    playersToAdd = sortAndSlice(otherPlayers, avgRank >= 6.5, amountToFill)
  }

  return [...group, ...playersToAdd]
}

const ensureGroupSize = (
  group: PlayerDocument[],
  skillGroup: Skill,
  attendance: PlayerDocument[],
): PlayerDocument[] => {
  if (group.length >= 14) return group.slice(0, 14)
  return sortPlayersBasedOnSkillGroup(skillGroup, group, attendance)
}

// skill based logic
const getPlayersBySkillGroup = async (skillGroup: Skill) => {
  const activeTraining = await Training.findOne({ isActive: true }).populate<{
    attendance: PlayerDocument[]
  }>('attendance')

  if (!activeTraining) throw new Error('No active training')

  if (activeTraining.attendance.length < 14) {
    throw new Error('You need at least 14 players in attendance to play.')
  }

  const filteredPlayers = activeTraining.attendance
    .filter((player) => player.skill === skillGroup)
    .sort((a, b) => (a.games_played ?? 0) - (b.games_played ?? 0))

  const finalGroup = ensureGroupSize(filteredPlayers, skillGroup, activeTraining.attendance)
  const sortedPlayers = sortByGamesPlayed(finalGroup)
  const playerIds = sortedPlayers.map((p) => p._id)

  await Training.findOneAndUpdate(
    { isActive: true },
    {
      initialized_players: playerIds,
      initializedSkillGroup: skillGroup,
      initializedTeam: null,
    },
  )
}

// start game logic
const startGame = async () => {
  const activeTraining = await Training.findOne({ isActive: true })
  if (!activeTraining) throw new Error('No active training')

  const playerIds = activeTraining.initialized_players
  if (!playerIds || playerIds.length === 0)
    throw new Error('No initialized players')

  activeTraining.current_players = playerIds
  activeTraining.currentGameSkillGroup =
    activeTraining.initializedSkillGroup || ''
  activeTraining.initialized_players = []
  activeTraining.initializedSkillGroup = ''
  activeTraining.games_today += 1

  // update games_by_skill
  if (activeTraining.currentGameSkillGroup) {
    const key = activeTraining.currentGameSkillGroup
    await Training.updateOne({ _id: activeTraining._id }, { $inc: { [`games_by_skill.${key}`]: 1 } })
  }

  await Player.updateMany(
    { _id: { $in: playerIds } },
    { $inc: { games_played: 1 } },
  )

  await activeTraining.save()
  const updatedPlayers = await Player.find({ _id: { $in: playerIds } })
  return updatedPlayers
}

const replacePlayer = async (outPlayerId: string, inPlayerId: string) => {
  const outPlayer = await Player.findById(outPlayerId)
  const inPlayer = await Player.findById(inPlayerId)

  if (!outPlayer || !inPlayer) {
    throw new Error('Player not found.')
  }

  const activeTraining = await Training.findOne({ isActive: true })
  if (!activeTraining) {
    throw new Error('No active training.')
  }

  const index = activeTraining.initialized_players.findIndex(
    (id) => id?.toString() === outPlayerId,
  )

  if (index === -1) {
    throw new Error('Player not in initialized list.')
  }

  activeTraining.initialized_players[index] = new Types.ObjectId(inPlayerId)
  await activeTraining.save()

  return { outPlayer, inPlayer }
}

export default {
  getPlayersBySkillGroup,
  startGame,
  replacePlayer,
}