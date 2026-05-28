import mongoose, { Schema, Document, Model, Types } from "mongoose"

export interface ISiteSettings extends Document {
  _id: Types.ObjectId
  key: string
  value: Record<string, unknown>
  updatedAt: Date
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
)

const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings ||
  mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema)

export default SiteSettings

// Helper functions
export async function getSetting(key: string): Promise<Record<string, unknown> | null> {
  const setting = await SiteSettings.findOne({ key })
  return setting?.value || null
}

export async function setSetting(
  key: string,
  value: Record<string, unknown>
): Promise<ISiteSettings> {
  return SiteSettings.findOneAndUpdate(
    { key },
    { key, value },
    { upsert: true, new: true }
  )
}
