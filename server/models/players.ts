import mongoose, { Schema, Document, Model } from 'mongoose'

export type Gender = 'male' | 'female'
export type Skill = 'beginner' | 'intermediate' | 'advanced'

export interface PlayerDocument extends Document {
  name: string;
  birthday?: Date;
  gender: Gender;
  skill: Skill;
  rank: number;
  games_played: number;
  paid: boolean;
  late: boolean;
}

const playerSchema = new Schema<PlayerDocument>({
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
    required: true,
    enum: ['male', 'female'],
  },
  skill: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced'],
  },
  rank: {
    type: Number,
    min: 0.5,
    max: 10,
  },
  games_played: {
    type: Number,
    default: 0,
  },
  paid: {
    type: Boolean,
    default: false,
  },
  late: {
    type: Boolean,
    default: false,
  },
})

playerSchema.set('toJSON', {
  transform: (_document, returnedObject: any) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

const Player: Model<PlayerDocument> = mongoose.model<PlayerDocument>(
  'Player',
  playerSchema,
)

export default Player
