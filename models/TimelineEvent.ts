import mongoose from 'mongoose';

const TimelineEventSchema = new mongoose.Schema({
  headline: { type: String, required: true },
  text: { type: String, required: true },
  start_date: {
    year: { type: String, required: true },
    month: { type: String },
    day: { type: String }
  },
  end_date: {
    year: { type: String },
    month: { type: String },
    day: { type: String }
  },
  media: {
    url: String,
    caption: String,
    credit: String
  },
  group: String,           // e.g., "Milestone", "Event", "Broadcast"
  radioStation: { type: String, default: "Vibe FM" }
}, { timestamps: true });

export default mongoose.models.TimelineEvent || mongoose.model('TimelineEvent', TimelineEventSchema);
