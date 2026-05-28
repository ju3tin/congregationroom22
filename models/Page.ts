import mongoose, { Schema, Document, Model, Types } from "mongoose"

export interface IPage extends Document {
  _id: Types.ObjectId
  title: string
  slug: string
  content: string
  metaTitle?: string
  metaDescription?: string
  status: "published" | "draft"
  createdAt: Date
  updatedAt: Date
}

const PageSchema = new Schema<IPage>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    metaTitle: { type: String },
    metaDescription: { type: String },
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "draft",
    },
  },
  { timestamps: true }
)

PageSchema.index({ slug: 1 })
PageSchema.index({ status: 1 })

const Page: Model<IPage> =
  mongoose.models.Page || mongoose.model<IPage>("Page", PageSchema)

export default Page
