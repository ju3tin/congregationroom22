import mongoose, { Schema, Document, Model, Types } from "mongoose"

export interface IPromoCode extends Document {
  _id: Types.ObjectId
  code: string
  discountType: "percentage" | "fixed"
  discountValue: number
  minPurchase?: number
  maxUses?: number
  usedCount: number
  eventId?: Types.ObjectId
  validFrom: Date
  validUntil: Date
  createdAt: Date
}

const PromoCodeSchema = new Schema<IPromoCode>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: { type: Number, required: true },
    minPurchase: { type: Number },
    maxUses: { type: Number },
    usedCount: { type: Number, default: 0 },
    eventId: { type: Schema.Types.ObjectId, ref: "Event" },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
  },
  { timestamps: true }
)

PromoCodeSchema.index({ code: 1 })

const PromoCode: Model<IPromoCode> =
  mongoose.models.PromoCode ||
  mongoose.model<IPromoCode>("PromoCode", PromoCodeSchema)

export default PromoCode
