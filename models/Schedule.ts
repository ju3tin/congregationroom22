import mongoose, {
  Schema,
  Document,
  Model,
  Types,
} from "mongoose"

export interface IScheduleSlot {
  _id: Types.ObjectId
  dayOfWeek: number
  startTime: string
  endTime: string
  djId: Types.ObjectId
  showName: string
}

export interface ISchedule extends Document {
  _id: Types.ObjectId
  slots: IScheduleSlot[]
  createdAt: Date
  updatedAt: Date
}

const ScheduleSlotSchema =
  new Schema<IScheduleSlot>({
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    djId: {
      type: Schema.Types.ObjectId,
      ref: "DJ",
      required: true,
    },

    showName: {
      type: String,
      required: true,
    },
  })

const ScheduleSchema =
  new Schema<ISchedule>(
    {
      slots: [ScheduleSlotSchema],
    },
    {
      timestamps: true,
    }
  )

const Schedule: Model<ISchedule> =
  mongoose.models.Schedule ||
  mongoose.model<ISchedule>(
    "Schedule",
    ScheduleSchema
  )

export default Schedule
