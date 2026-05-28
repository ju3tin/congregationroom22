import mongoose, { Schema, Document, Model, Types } from "mongoose"

export interface ITicketTier {
  _id: Types.ObjectId
  name: string
  price: number
  quantity: number
  sold: number
  maxPerOrder: number
  salesStart: Date
  salesEnd: Date
}

export interface IEvent extends Document {
  _id: Types.ObjectId
  title: string
  slug: string
  description: string
  venue: {
    name: string
    address: string
    city: string
  }
  date: Date
  doors: Date
  endDate?: Date
  image: string
  organizerId: Types.ObjectId
  status: "draft" | "published" | "cancelled" | "completed"
  ticketTiers: ITicketTier[]
  createdAt: Date
  updatedAt: Date
}

const TicketTierSchema = new Schema<ITicketTier>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  sold: { type: Number, default: 0 },
  maxPerOrder: { type: Number, default: 10 },
  salesStart: { type: Date, required: true },
  salesEnd: { type: Date, required: true },
})

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    venue: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
    },
    date: { type: Date, required: true },
    doors: { type: Date, required: true },
    endDate: { type: Date },
    image: { type: String, required: true },
    organizerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["draft", "published", "cancelled", "completed"],
      default: "draft",
    },
    ticketTiers: [TicketTierSchema],
  },
  { timestamps: true }
)

EventSchema.index({ slug: 1 })
EventSchema.index({ status: 1, date: 1 })
EventSchema.index({ organizerId: 1 })

const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema)

export default Event
