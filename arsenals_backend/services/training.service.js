const Training = require('../models/training')
const Player = require('../models/players')
const Team = require('../models/team')

const sortAndSlice = (players, desc = true, amount = 0) => {
  return players
    .sort((a, b) => (desc ? b.rank - a.rank : a.rank - b.rank))
    .slice(0, amount)
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

// ── Skill-based game init ─────────────────────────────────────────────────────
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
  const playerIds = finalGroup.map(p => p._id)

  await Training.findOneAndUpdate(
    { isActive: true },
    {
      initialized_players: playerIds,
      initializedSkillGroup: skillGroup,
      initializedTeam: null,
      game_type: 'skill',
    }
  )

  const freshPlayers = await Player.find({ _id: { $in: playerIds } })
  return freshPlayers
}

// ── Team-based game init ──────────────────────────────────────────────────────
const getPlayersByTeam = async (teamId) => {
  const activeTraining = await Training
    .findOne({ isActive: true })
    .populate('attendance')

  if (!activeTraining) throw new Error('No active training')

  const team = await Team.findById(teamId).populate('players')
  if (!team) throw new Error('Team not found')

  // only include team members who are in attendance
  const attendanceIds = new Set(activeTraining.attendance.map(p => p._id.toString()))
  const teamInAttendance = team.players.filter(p => attendanceIds.has(p._id.toString()))

  if (teamInAttendance.length === 0) {
    throw new Error(`No ${team.name} players are in attendance`)
  }

  // fill to 14 if needed using skill-based logic
  let finalGroup = teamInAttendance
  if (finalGroup.length < 14) {
    const groupIds = new Set(finalGroup.map(p => p._id.toString()))
    const amountToFill = 14 - finalGroup.length
    const others = activeTraining.attendance
      .filter(p => !groupIds.has(p._id.toString()))
      .sort((a, b) => a.games_played - b.games_played)
    finalGroup = [...finalGroup, ...others.slice(0, amountToFill)]
  }

  finalGroup = finalGroup.slice(0, 14)
  const playerIds = finalGroup.map(p => p._id)

  await Training.findOneAndUpdate(
    { isActive: true },
    {
      initialized_players: playerIds,
      initializedTeam: teamId,
      initializedSkillGroup: '',
      game_type: 'team',
    }
  )

  const freshPlayers = await Player.find({ _id: { $in: playerIds } })
  return freshPlayers
}

// ── Start game ────────────────────────────────────────────────────────────────
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
  getPlayersByTeam,
  startGame,
}