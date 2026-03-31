const playersRouter = require('../controllers/players')
const Training = require('../models/training')
const Player = require('../models/players')

// helper
const sortAndSlice = (players, desc = true, amount = 0) => {
  return players.sort((a, b) => (desc ? b.rank - a.rank : a.rank - b.rank)).slice(0, amount)
}

// sort and fill players based on skill group
const sortPlayersBasedOnSkillGroup = async (skillGroup, group) => {
  const activeTraining = await Training.findOne({ isActive: true }).populate('attendance')
  if (!activeTraining) {
    throw new Error('No active training')
  }

  const amountToFill = 14 - group.length

  const otherPlayers = activeTraining.attendance.filter(
    player => player.skill !== skillGroup
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

    const desc = avgRank >= 6.5
    playersToAdd = sortAndSlice(otherPlayers, desc, amountToFill)
  }

  return [...group, ...playersToAdd]
}

// ensures the group has 14 players
const ensureGroupSize = async (group, skillGroup) => {
  const maxPlayers = 14
  if (group.length >= maxPlayers) return group.slice(0, maxPlayers)
  return await sortPlayersBasedOnSkillGroup(skillGroup, group)
}

// fetches players by skill group
const getPlayersBySkillGroup = async (skillGroup) => {
  const activeTraining = await Training
    .findOne({ isActive: true })
    .populate('attendance')

  if (!activeTraining) {
    throw new Error('No active training')
  }

  const filteredPlayers = activeTraining.attendance
    .filter(player => player.skill === skillGroup)
    .sort((a, b) => a.games_played - b.games_played)

  const finalGroup = await ensureGroupSize(filteredPlayers, skillGroup)

  // update current_players in DB
  const playerIds = finalGroup.map(p => p._id)
  await Training.findOneAndUpdate(
    { isActive: true },
    { initialized_players: playerIds }
  )

  return finalGroup
}

const startGame = async () => {
  const activeTraining = await Training.findOne({ isActive: true })

  if (!activeTraining) {
    throw new Error('No active training')
  }

  const playerIds = activeTraining.initialized_players

  if (!playerIds || playerIds.length === 0) {
    throw new Error('No initialized players')
  }

  activeTraining.current_players = playerIds
  activeTraining.initialized_players = []

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
  startGame
}
