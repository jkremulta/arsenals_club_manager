const mongoose = require('mongoose')

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }]
})

teamSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Team = mongoose.model('Team', teamSchema)
module.exports = Team
