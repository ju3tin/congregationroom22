import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured") === "true";

    let query: any = { status: "published" };

    if (featured) {
      query.featured = true;
    }

    const events = await Event.find(query)
      .sort({ date: 1 })
      .populate("lineup.dj", "name") // Optional: populate DJ names
      .lean();

    return NextResponse.json(events);
  } catch (error) {
    console.error("Events API Error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
