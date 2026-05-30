import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TimelineEvent from '@/models/TimelineEvent';

export async function GET() {
  try {
    console.log('Timeline API HIT');

    await connectDB();
    console.log('DB CONNECTED');

    const events = await TimelineEvent.find().sort({
      'start_date.year': 1,
      'start_date.month': 1,
      'start_date.day': 1,
    });

    const timelineData = {
      title: {
        text: {
          headline: 'Vibe FM Radio Station',
          text: 'Our Journey & Milestones',
        },
      },

      events: events.map((event: any) => {
        const timelineEvent: any = {
          start_date: {
            year: event.start_date?.year || '',
            month: event.start_date?.month || '',
            day: event.start_date?.day || '',
          },

          text: {
            headline: event.headline,
            text: event.text,
          },
        };

        // ✅ END DATE (only if valid)
        if (event.end_date?.year) {
          timelineEvent.end_date = {
            year: event.end_date.year,
            month: event.end_date.month || '',
            day: event.end_date.day || '',
          };
        }

        // ✅ MEDIA (only if url exists)
        if (event.media?.url) {
          timelineEvent.media = {
            url: event.media.url,
            caption: event.media.caption || '',
            credit: event.media.credit || '',
            thumbnail: event.media.thumbnail || '',
          };
        }

        // ✅ ASSETS (only if array has items)
        if (event.assets?.length > 0) {
          timelineEvent.assets = event.assets.map((asset: any) => ({
            title: asset.title,
            url: asset.url,
            type: asset.type,
            caption: asset.caption || '',
          }));
        }

        // ✅ GROUP
        if (event.group) {
          timelineEvent.group = event.group;
        }

        return timelineEvent;
      }),
    };

    return NextResponse.json(timelineData);
  } catch (error: any) {
    console.error('Timeline API Error:', error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to load timeline data',
      },
      { status: 500 }
    );
  }
}
