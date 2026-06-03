import mongoose, {
  Schema,
  Document,
  Model,
  Types,
} from "mongoose"

export interface IMix extends Document {
  _id: Types.ObjectId

  title: string
  slug: string

  djId: Types.ObjectId

  genre: string
  description?: string

  duration: number

  audioUrl: string
  coverImage: string

  releaseDate: Date

  plays: number

  featured: boolean

  createdAt: Date
  updatedAt: Date
}

const MixSchema = new Schema<IMix>(
  {
    title: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    djId: {
      type: Schema.Types.ObjectId,
      ref: "DJ",
      required: true,
    },

    genre: {
      type: String,
      required: true,
    },

    description: String,

    duration: {
      type: Number,
      required: true,
    },

    audioUrl: {
      type: String,
      required: true,
    },

    coverImage: {
      type: String,
      required: true,
    },

    releaseDate: {
      type: Date,
      required: true,
    },

    plays: {
      type: Number,
      default: 0,
    },

    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

MixSchema.index({ djId: 1 })
MixSchema.index({ releaseDate: -1 })
MixSchema.index({ featured: 1 })

const Mix: Model<IMix> =
  mongoose.models.Mix ||
  mongoose.model<IMix>("Mix", MixSchema)

export default Mix
