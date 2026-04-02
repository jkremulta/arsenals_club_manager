const mongoose = require('mongoose')

const trainingSchema = new mongoose.Schema({
  startTime: {
    type: Date,
    required: true
  },
  isActive: Boolean,
  games_today: {
    type: Number,
    default: 0
  },
  games_by_skill: {
    beginner: { type: Number, default: 0 },
    intermediate: { type: Number, default: 0 },
    advanced: { type: Number, default: 0 }
  },
  attendance: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }],
  current_players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }],
  initializedSkillGroup: String,
  currentGameSkillGroup: String,
  initialized_players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }]
})

trainingSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Training = mongoose.model('Training', trainingSchema)

module.exports = Training