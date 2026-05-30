import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TimelineEvent from '@/models/TimelineEvent';

export async function GET() {
  try {
    await connectDB();

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
        const item: any = {
          start_date: {
            year: event.start_date?.year || '',
            month: event.start_date?.month || '',
            day: event.start_date?.day || '',
          },

          text: {
            headline: event.headline || '',
            text: event.text || '',
          },
        };

        // ✅ END DATE (only if valid)
        if (event.end_date?.year) {
          item.end_date = {
            year: event.end_date.year,
            month: event.end_date.month || '',
            day: event.end_date.day || '',
          };
        }

        // ✅ MEDIA (Timeline style main media)
        if (event.media?.url) {
          item.media = {
            url: event.media.url,
            caption: event.media.caption || '',
            credit: event.media.credit || '',
            thumbnail: event.media.thumbnail || '',
          };
        }

        // ✅ ASSETS (your social + extras)
        if (Array.isArray(event.assets) && event.assets.length > 0) {
          item.assets = event.assets
            .filter((a: any) => a?.url)
            .map((a: any) => ({
              type: a.type || 'image',
              title: a.title || '',
              url: a.url,
              caption: a.caption || '',
            }));
        }

        // ✅ GROUP
        if (event.group) {
          item.group = event.group;
        }

        return item;
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
