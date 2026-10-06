import mongoose, {
    Schema,
    Document,
    Model,
    Types,
  } from "mongoose";
  
  export interface ITimelineDate {
    year: number;
    month?: number;
    day?: number;
    hour?: number;
    minute?: number;
    second?: number;
  }
  
  export type TimelineMediaType =
    | "image"
    | "youtube"
    | "instagram"
    | "tiktok";
  
  export interface ITimelineMedia {
    type: TimelineMediaType;
    url: string;
    caption?: string;
    credit?: string;
  }
  
  export interface ITimelineBackground {
    color?: string;
    url?: string;
  }
  
  export interface ITimelineEvent00 extends Document {
    _id: Types.ObjectId;
  
    id: string;
  
    start_date: ITimelineDate;
  
    end_date?: ITimelineDate;
  
    title: string;
  
    text?: string;
  
    group?: string;
  
    background?: ITimelineBackground;
  
    media?: ITimelineMedia;
  
    createdAt: Date;
  
    updatedAt: Date;
  }
  
  const TimelineDateSchema =
    new Schema<ITimelineDate>(
      {
        year: {
          type: Number,
          required: true,
        },
  
        month: {
          type: Number,
        },
  
        day: {
          type: Number,
        },
  
        hour: {
          type: Number,
        },
  
        minute: {
          type: Number,
        },
  
        second: {
          type: Number,
        },
      },
      {
        _id: false,
      }
    );
  
  const TimelineMediaSchema =
    new Schema<ITimelineMedia>(
      {
        type: {
          type: String,
          enum: [
            "image",
            "youtube",
            "instagram",
            "tiktok",
          ],
          required: true,
        },
  
        url: {
          type: String,
          required: true,
        },
  
        caption: {
          type: String,
        },
  
        credit: {
          type: String,
        },
      },
      {
        _id: false,
      }
    );
  
  const TimelineBackgroundSchema =
    new Schema<ITimelineBackground>(
      {
        color: {
          type: String,
        },
  
        url: {
          type: String,
        },
      },
      {
        _id: false,
      }
    );
  
  const TimelineEvent00Schema =
    new Schema<ITimelineEvent00>(
      {
        id: {
          type: String,
          required: true,
          unique: true,
          index: true,
        },
  
        start_date: {
          type: TimelineDateSchema,
          required: true,
        },
  
        end_date: {
          type: TimelineDateSchema,
        },
  
        title: {
          type: String,
          required: true,
        },
  
        text: {
          type: String,
          default: "",
        },
  
        group: {
          type: String,
        },
  
        background: {
          type: TimelineBackgroundSchema,
        },
  
        media: {
          type: TimelineMediaSchema,
        },
      },
      {
        timestamps: true,
      }
    );
  
  const TimelineEvent00: Model<ITimelineEvent00> =
    mongoose.models.TimelineEvent00 ||
    mongoose.model<ITimelineEvent00>(
      "TimelineEvent00",
      TimelineEvent00Schema
    );
  
  export default TimelineEvent00;