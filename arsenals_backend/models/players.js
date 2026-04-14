const mongoose = require('mongoose')

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 50,
  },
  birthday: {
    type: Date,
  },
  gender: {
    type: String,
    required: true
  },
  skill: {
    type: String,
    required: true
  },
  rank: {
    type: Number
  },
  games_played: {
    type: Number,
    default: 0
  },
  paid: {
    type: Boolean,
    default: false
  },
  late: {
    type: Boolean,
    default: false
  }
})

playerSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Player = mongoose.model('Player', playerSchema)

module.exports = Player
