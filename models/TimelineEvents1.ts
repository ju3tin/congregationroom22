import mongoose, { Schema, Document } from "mongoose";

const TimelineEvent1Schema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    startDate: {
      year: { type: Number, required: true },
      month: { type: Number },
      day: { type: Number },
    },
    endDate: {
      year: { type: Number },
      month: { type: Number },
      day: { type: Number },
    },
    category: String,
    tags: [String],
    media: {
      url: String,
      caption: String,
      credit: String,
      thumbnail: String,
    },
    location: {
      name: String,
      latitude: Number,
      longitude: Number,
    },
    sources: [
      {
        title: String,
        url: String,
      },
    ],
    featured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.TimelineEvents1 || mongoose.model("TimelineEvents1", TimelineEvent1Schema);
