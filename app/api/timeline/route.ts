import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TimelineEvent from '@/models/TimelineEvent';

export async function GET() {
  await connectDB();

  const events = await TimelineEvent.find().sort({ 
    'start_date.year': 1, 
    'start_date.month': 1 
  });

  const timelineData = {
    title: {
      text: {
        headline: "Vibe FM Radio Station",
        text: "Our Journey & Milestones"
      }
    },
    events: events.map((event: any) => ({
      start_date: {
        year: event.start_date?.year || "",
        month: event.start_date?.month || "",
        day: event.start_date?.day || ""
      },
      end_date: event.end_date ? {
        year: event.end_date.year,
        month: event.end_date.month,
        day: event.end_date.day
      } : undefined,
      text: {
        headline: event.headline,
        text: event.text
      },
      media: event.media?.url ? event.media : undefined,
      group: event.group || "General"
    }))
  };

  return NextResponse.json(timelineData);
}
