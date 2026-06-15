import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured") === "true";
    const limit = parseInt(searchParams.get("limit") || "10");

    let query: any = {};

    if (featured) {
      query.featured = true;
      query.status = "published";
    } else {
      query.status = "published";
    }

    const events = await Event.find(query)
      .sort({ date: 1 })
      .limit(limit)
      .lean();

    const formattedEvents = events.map((event: any) => ({
      id: event._id.toString(),
      title: event.title,
      slug: event.slug,
      description: event.description,
      image: event.image,
      date: event.date,
      doors: event.doors,
      venue: event.venue,
      status: event.status,
      featured: event.featured || false,
      lineup: event.lineup || [],
    }));

    return NextResponse.json(formattedEvents);
  } catch (error) {
    console.error("Events API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
