import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import TimelineEvents from "@/models/TimelineEvents1";

export async function GET() {
  try {
    await dbConnect();

    const events = await TimelineEvents.find()
      .sort({ sortOrder: 1, "startDate.year": -1 })
      .lean();

    const timelineData = {
      title: {
        text: {
          headline: "Our Timeline",
          text: "Key moments and events",
        },
      },
      events: events.map((event: any) => {
        // Safe string conversion
        const startDate = {
          year: event.startDate?.year ? String(event.startDate.year) : "",
          month: event.startDate?.month ? String(event.startDate.month) : undefined,
          day: event.startDate?.day ? String(event.startDate.day) : undefined,
        };

        // Only include end_date if it actually exists and has a year
        let endDate = undefined;
        if (event.endDate && event.endDate.year) {
          endDate = {
            year: String(event.endDate.year),
            month: event.endDate.month ? String(event.endDate.month) : undefined,
            day: event.endDate.day ? String(event.endDate.day) : undefined,
          };
        }

        return {
          unique_id: event._id.toString(),

          start_date: startDate,
          ...(endDate && { end_date: endDate }),

          text: {
            headline: event.title || "Untitled Event",
            text: event.description || "",
          },

          media: event.media?.url
            ? {
                url: event.media.url,
                caption: event.media.caption || "",
                credit: event.media.credit || "",
                thumbnail: event.media.thumbnail || undefined,
              }
            : undefined,

          group: event.category || "General",
          tags: event.tags?.length ? event.tags.join(", ") : undefined,

          background: event.featured ? { color: "#e6f0fa" } : undefined,
        };
      }),
    };

    return NextResponse.json(timelineData);
  } catch (error) {
    console.error("Timeline API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch timeline events" },
      { status: 500 }
    );
  }
}
