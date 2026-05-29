import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TimelineEvent from '@/models/TimelineEvent';

export async function GET() {
  await connectDB();

  const events = await TimelineEvent.find().sort({ 'start_date.year': 1, 'start_date.month': 1 });

  const timelineData = {
    title: {
      text: {
        headline: "Vibe FM Radio Station",
        text: "Our Journey & Milestones"
      }
    },
    events: events.map(event => ({
      start_date: event.start_date,
      end_date: event.end_date || undefined,
      text: {
        headline: event.headline,
        text: event.text
      },
      media: event.media || undefined,
      group: event.group
    }))
  };

  return NextResponse.json(timelineData);
}
