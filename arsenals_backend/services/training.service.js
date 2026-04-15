const Training = require('../models/training')
const Player = require('../models/players')
const Team = require('../models/team')

// helper
const sortAndSlice = (players, desc = true, amount = 0) => {
  return players
    .sort((a, b) => (desc ? b.rank - a.rank : a.rank - b.rank))
    .slice(0, amount)
}

const sortByGamesPlayed = (players) => {
  return [...players].sort((a, b) => {
    const byGames = (a.games_played ?? 0) - (b.games_played ?? 0)
    return byGames !== 0 ? byGames : (a.name ?? '').localeCompare(b.name ?? '')
  })
}

const sortPlayersBasedOnSkillGroup = async (skillGroup, group) => {
  const activeTraining = await Training.findOne({ isActive: true }).populate('attendance')
  if (!activeTraining) throw new Error('No active training')

  const groupIds = new Set(group.map(p => p._id.toString()))
  const amountToFill = 14 - group.length
  const otherPlayers = activeTraining.attendance.filter(
    player => player.skill !== skillGroup && !groupIds.has(player._id.toString())
  )

  let playersToAdd = []
  
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

const ensureGroupSize = async (group, skillGroup) => {
  if (group.length >= 14) return group.slice(0, 14)
  return await sortPlayersBasedOnSkillGroup(skillGroup, group)
}

// skill based logic
const getPlayersBySkillGroup = async (skillGroup) => {
  const activeTraining = await Training
    .findOne({ isActive: true })
    .populate('attendance')

  if (!activeTraining) throw new Error('No active training')

  if (activeTraining.attendance.length < 14) {
    throw new Error('You need at least 14 players in attendance to play.')
  }

  const filteredPlayers = activeTraining.attendance
    .filter(player => player.skill === skillGroup)
    .sort((a, b) => a.games_played - b.games_played)

  const finalGroup = await ensureGroupSize(filteredPlayers, skillGroup)
  const sortedPlayers = sortByGamesPlayed(finalGroup)
  const playerIds = sortedPlayers.map(p => p._id)

  await Training.findOneAndUpdate(
    { isActive: true },
    {
      initialized_players: playerIds,
      initializedSkillGroup: skillGroup,
      initializedTeam: null,
      game_type: 'skill',
      team_a: null,
      team_b: null,
    }
  )

  const freshPlayers = await Player.find({ _id: { $in: playerIds } })
  const byId = new Map(freshPlayers.map(player => [player.id, player]))
  return playerIds
    .map(id => byId.get(id.toString()))
    .filter(Boolean)
}

// team based logic
const getPlayersByTeams = async (teamAId, teamBId) => {
  if (teamAId === teamBId) {
    throw new Error('Please select two different teams')
  }

  const activeTraining = await Training
    .findOne({ isActive: true })
    .populate('attendance')

  if (!activeTraining) throw new Error('No active training')
  const attendanceIds = new Set(activeTraining.attendance.map(player => player._id.toString()))

  const [teamA, teamB] = await Promise.all([
    Team.findById(teamAId).populate('players'),
    Team.findById(teamBId).populate('players'),
  ])

  if (!teamA || !teamB) throw new Error('Team not found')

  const teamAPlayers = teamA.players.filter(player => attendanceIds.has(player._id.toString()))
  const teamBPlayers = teamB.players.filter(player => attendanceIds.has(player._id.toString()))

  if (teamAPlayers.length === 0) {
    throw new Error(`No ${teamA.name} players are in attendance`)
  }

  if (teamBPlayers.length === 0) {
    throw new Error(`No ${teamB.name} players are in attendance`)
  }

  const teamAIds = new Set(teamAPlayers.map(player => player._id.toString()))
  const uniqueTeamBPlayers = teamBPlayers.filter(player => !teamAIds.has(player._id.toString()))

  if (uniqueTeamBPlayers.length === 0) {
    throw new Error('No eligible Team B players after removing duplicates')
  }

  const sortedPlayers = sortByGamesPlayed([...teamAPlayers, ...uniqueTeamBPlayers])
  const playerIds = sortedPlayers.map(player => player._id)

  await Training.findOneAndUpdate(
    { isActive: true },
    {
      initialized_players: playerIds,
      initializedTeam: null,
      initializedSkillGroup: '',
      currentGameSkillGroup: '',
      currentGameTeam: null,
      game_type: 'team',
      team_a: teamAId,
      team_b: teamBId,
    }
  )

  const freshPlayers = await Player.find({ _id: { $in: playerIds } })
  const byId = new Map(freshPlayers.map(player => [player.id, player]))
  return playerIds
    .map(id => byId.get(id.toString()))
    .filter(Boolean)
}

// start game logic
const startGame = async () => {
  const activeTraining = await Training.findOne({ isActive: true })
  if (!activeTraining) throw new Error('No active training')

  const playerIds = activeTraining.initialized_players
  if (!playerIds || playerIds.length === 0) throw new Error('No initialized players')

  activeTraining.current_players = playerIds
  activeTraining.currentGameSkillGroup = activeTraining.initializedSkillGroup || ''
  activeTraining.currentGameTeam = activeTraining.initializedTeam || null
  activeTraining.initialized_players = []
  activeTraining.initializedSkillGroup = ''
  activeTraining.initializedTeam = null
  activeTraining.games_today += 1

  if (activeTraining.game_type === 'skill') {
    activeTraining.team_a = null
    activeTraining.team_b = null
  }

  // update games_by_skill if skill game
  if (activeTraining.game_type === 'skill' && activeTraining.currentGameSkillGroup) {
    const key = activeTraining.currentGameSkillGroup
    if (['beginner', 'intermediate', 'advanced'].includes(key)) {
      activeTraining.games_by_skill[key] = (activeTraining.games_by_skill[key] || 0) + 1
    }
  }

  await Player.updateMany(
    { _id: { $in: playerIds } },
    { $inc: { games_played: 1 } }
  )

  await activeTraining.save()
  const updatedPlayers = await Player.find({ _id: { $in: playerIds } })
  return updatedPlayers
}

module.exports = {
  getPlayersBySkillGroup,
  getPlayersByTeams,
  startGame,
}
