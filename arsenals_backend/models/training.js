const mongoose = require('mongoose')

const trainingSchema = new mongoose.Schema({
  startTime: {
    type: Date,
    required: true
  },
  isActive: Boolean,
  attendance: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }],
  current_players: [{
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