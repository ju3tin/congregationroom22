// app/api/events/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const event = await Event.findOne({ 
      slug: slug.toLowerCase() 
    })
      .populate({
        path: 'lineup.dj',
        model: 'DJ',
        select: 'name slug image genre'
      })
      .lean();

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Only return published events (optional security)
    if (event.status !== "published") {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);

  } catch (error) {
    console.error("Single Event API Error:", error);
    return NextResponse.json({ 
      error: "Failed to fetch event" 
    }, { status: 500 });
  }
}
