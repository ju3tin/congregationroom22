import mongoose, { Schema, Document, Model, Types } from "mongoose"

export interface IProductVariant {
  _id: Types.ObjectId
  name: string
  sku: string
  price: number
  stock: number
}

export interface IProduct extends Document {
  _id: Types.ObjectId
  name: string
  slug: string
  description: string
  images: string[]
  category: string
  eventId?: Types.ObjectId
  variants: IProductVariant[]
  status: "active" | "draft" | "archived"
  createdAt: Date
  updatedAt: Date
}

const ProductVariantSchema = new Schema<IProductVariant>({
  name: { type: String, required: true },
  sku: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
})

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    images: [{ type: String }],
    category: { type: String, required: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event" },
    variants: [ProductVariantSchema],
    status: {
      type: String,
      enum: ["active", "draft", "archived"],
      default: "draft",
    },
  },
  { timestamps: true }
)

ProductSchema.index({ slug: 1 })
ProductSchema.index({ status: 1 })
ProductSchema.index({ category: 1 })

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema)

export default Product
