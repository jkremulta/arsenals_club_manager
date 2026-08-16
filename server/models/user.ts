import mongoose, { Schema, Document, Model } from 'mongoose'

export interface UserDocument extends Document {
  username: string;
  passwordHash: string;
}

const userSchema = new Schema<UserDocument>({
  username: {
    type: String,
    required: true,
    minlength: 3,
    unique: true,
  },
  passwordHash: String,
})

type UserJSON = UserDocument & {
  _id: mongoose.Types.ObjectId;
  __v?: number;
  id?: string;
}

userSchema.set('toJSON', {
  transform: (_document, returnedObject: UserJSON) => {
    returnedObject.id = returnedObject._id.toString()
    delete (returnedObject as Partial<UserJSON>)._id
    delete (returnedObject as Partial<UserJSON>).__v
    delete (returnedObject as Partial<UserJSON>).passwordHash
  },
})

const User: Model<UserDocument> = mongoose.model<UserDocument>('User', userSchema)

export default User