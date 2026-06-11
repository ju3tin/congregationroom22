import mongoose, { Schema, Document, Model, Types } from "mongoose"

export interface IDJ extends Document {
  _id: Types.ObjectId
  name: string
  slug: string
  genre: string
  bio: string
  image: string
  socialLinks: {
    instagram?: string
    soundcloud?: string
    twitter?: string
  }
  featured: boolean          // ← NEW
  createdAt: Date
  updatedAt: Date
}

const DJSchema = new Schema<IDJ>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    genre: { type: String, required: true },
    bio: { type: String, required: true },
    image: { type: String, required: true },
    socialLinks: {
      instagram: String,
      soundcloud: String,
      twitter: String,
    },
    featured: { 
      type: Boolean, 
      default: false 
    },   // ← Added here
  },
  { timestamps: true }
)

DJSchema.index({ genre: 1 })
DJSchema.index({ featured: 1 })   // ← Optional: Good for querying featured DJs

const DJ: Model<IDJ> =
  mongoose.models.DJ || mongoose.model<IDJ>("DJ", DJSchema)

export default DJ
