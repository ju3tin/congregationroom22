import mongoose, { Schema, Document, Model, Types } from "mongoose"

export interface IOrderItem {
  itemType: "ticket" | "merch"
  eventId?: Types.ObjectId
  tierId?: Types.ObjectId
  productId?: Types.ObjectId
  variantId?: Types.ObjectId
  quantity: number
  unitPrice: number
  name: string
}

export interface IOrder extends Document {
  _id: Types.ObjectId
  orderNumber: string
  userId: Types.ObjectId
  type: "ticket" | "merch" | "mixed"
  items: IOrderItem[]
  subtotal: number
  discount: number
  promoCode?: string
  total: number
  paypalOrderId: string
  paypalCaptureId?: string
  status: "pending" | "paid" | "refunded" | "cancelled"
  createdAt: Date
  updatedAt: Date
}

const OrderItemSchema = new Schema<IOrderItem>({
  itemType: { type: String, enum: ["ticket", "merch"], required: true },
  eventId: { type: Schema.Types.ObjectId, ref: "Event" },
  tierId: { type: Schema.Types.ObjectId },
  productId: { type: Schema.Types.ObjectId, ref: "Product" },
  variantId: { type: Schema.Types.ObjectId },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  name: { type: String, required: true },
})

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["ticket", "merch", "mixed"], required: true },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    promoCode: { type: String },
    total: { type: Number, required: true },
    paypalOrderId: { type: String, required: true },
    paypalCaptureId: { type: String },
    status: {
      type: String,
      enum: ["pending", "paid", "refunded", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
)

OrderSchema.index({ orderNumber: 1 })
OrderSchema.index({ userId: 1 })
OrderSchema.index({ status: 1 })

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema)

export default Order
