import Training from '../models/training'
import Player from '../models/players'
import type { Skill, PlayerDocument } from '../models/players'

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

  const freshPlayers = await Player.find({ _id: { $in: playerIds } })
  const byId = new Map(freshPlayers.map((player) => [player.id, player]))
  return playerIds.map((id) => byId.get(id.toString())).filter(Boolean)
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
    const key = activeTraining.currentGameSkillGroup as Skill

    activeTraining.games_by_skill[key] =
      (activeTraining.games_by_skill[key] || 0) + 1
  }

  await Player.updateMany(
    { _id: { $in: playerIds } },
    { $inc: { games_played: 1 } },
  )

  await activeTraining.save()
  const updatedPlayers = await Player.find({ _id: { $in: playerIds } })
  return updatedPlayers
}

export default {
  getPlayersBySkillGroup,
  startGame,
}
