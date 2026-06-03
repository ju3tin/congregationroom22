import mongoose, { Schema, Document, Model, Types } from "mongoose"

const TimelineEventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    startDate: {
      year: { type: Number, required: true },
      month: Number,
      day: Number
    },

    endDate: {
      year: Number,
      month: Number,
      day: Number
    },

    category: String,

    tags: [String],

    media: {
      url: String,
      caption: String,
      credit: String,
      thumbnail: String
    },

    location: {
      name: String,
      latitude: Number,
      longitude: Number
    },

    sources: [
      {
        title: String,
        url: String
      }
    ],

    featured: {
      type: Boolean,
      default: false
    },

    sortOrder: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("TimelineEvents", TimelineEventSchema);
