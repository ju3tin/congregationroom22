import mongoose, { Schema, Document, Model, Types } from "mongoose"

export interface ITicket extends Document {
  _id: Types.ObjectId
  ticketCode: string
  orderId: Types.ObjectId
  eventId: Types.ObjectId
  tierId: Types.ObjectId
  userId: Types.ObjectId
  tierName: string
  eventTitle: string
  eventDate: Date
  venue: string
  status: "valid" | "used" | "cancelled" | "refunded"
  scannedAt?: Date
  scannedBy?: Types.ObjectId
  createdAt: Date
}

const TicketSchema = new Schema<ITicket>(
  {
    ticketCode: { type: String, required: true, unique: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    tierId: { type: Schema.Types.ObjectId, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tierName: { type: String, required: true },
    eventTitle: { type: String, required: true },
    eventDate: { type: Date, required: true },
    venue: { type: String, required: true },
    status: {
      type: String,
      enum: ["valid", "used", "cancelled", "refunded"],
      default: "valid",
    },
    scannedAt: { type: Date },
    scannedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
)

TicketSchema.index({ ticketCode: 1 })
TicketSchema.index({ userId: 1 })
TicketSchema.index({ eventId: 1 })
TicketSchema.index({ orderId: 1 })

const Ticket: Model<ITicket> =
  mongoose.models.Ticket || mongoose.model<ITicket>("Ticket", TicketSchema)

export default Ticket
