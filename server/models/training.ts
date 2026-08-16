import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface GamesBySkill {
  beginner: number;
  intermediate: number;
  advanced: number;
}

export interface TrainingDocument extends Document {
  startTime: Date;
  isActive: boolean;
  games_today: number;
  games_by_skill: GamesBySkill;
  attendance: Types.ObjectId[];
  current_players: Types.ObjectId[];
  initializedSkillGroup?: string;
  currentGameSkillGroup?: string;
  initializedTeam?: Types.ObjectId | null;
  currentGameTeam?: Types.ObjectId | null;
  initialized_players: Types.ObjectId[];
}

const trainingSchema = new Schema<TrainingDocument>({
  startTime: {
    type: Date,
    required: true,
  },
  isActive: Boolean,
  games_today: {
    type: Number,
    default: 0,
  },
  games_by_skill: {
    beginner: { type: Number, default: 0 },
    intermediate: { type: Number, default: 0 },
    advanced: { type: Number, default: 0 },
  },
  attendance: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Player',
    },
  ],
  current_players: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Player',
    },
  ],
  initializedSkillGroup: String,
  currentGameSkillGroup: String,
  initializedTeam: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    default: null,
  },
  currentGameTeam: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    default: null,
  },
  initialized_players: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Player',
    },
  ],
})

type TrainingJSON = TrainingDocument & {
  _id: mongoose.Types.ObjectId;
  __v?: number;
  id?: string;
}

trainingSchema.set('toJSON', {
  transform: (_document, returnedObject: TrainingJSON) => {
    returnedObject.id = returnedObject._id.toString()
    delete (returnedObject as Partial<TrainingJSON>)._id
    delete (returnedObject as Partial<TrainingJSON>).__v
  },
})

const Training: Model<TrainingDocument> = mongoose.model<TrainingDocument>(
  'Training',
  trainingSchema,
)

export default Training
