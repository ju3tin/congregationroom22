import mongoose, { Schema, Document, Model, Types } from "mongoose"

export interface IUser extends Document {
  _id: Types.ObjectId
  email: string
  password: string
  name: string
  role: "customer" | "admin" | "organizer" | "staff"
  organizerId?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["customer", "admin", "organizer", "staff"],
      default: "customer",
    },
    organizerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
)

UserSchema.index({ role: 1 })

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default User
