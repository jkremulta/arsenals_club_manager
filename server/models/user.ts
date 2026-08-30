import mongoose, { Schema, Document, Model } from 'mongoose'

export interface UserDocument extends Document {
  username: string;
  passwordHash: string;
}

const userSchema = new Schema<UserDocument>({
  username: { type: String, required: true, minlength: 3, unique: true },
  passwordHash: String,
})

type UserJSON = Omit<UserDocument, '_id' | 'passwordHash'> & {
  _id: mongoose.Types.ObjectId;
  __v?: number;
  id?: string;
  passwordHash?: string;
}

userSchema.set('toJSON', {
  transform: (_document, ret: UserJSON) => {
    ret.id = ret._id.toString()
    delete (ret as Partial<UserJSON>)._id
    delete (ret as Partial<UserJSON>).__v
    delete (ret as Partial<UserJSON>).passwordHash
    return ret
  },
})

const User: Model<UserDocument> = mongoose.model<UserDocument>('User', userSchema)

export default User