import mongoose, { Schema, model, models } from "mongoose"

const ScheduleSlotSchema = new Schema(
  {
    dayOfWeek: Number,
    startTime: String,
    endTime: String,
    djId: String,
    showName: String,
  },
  { timestamps: true }
)

export default models.ScheduleSlot || model("ScheduleSlot", ScheduleSlotSchema)
