// app/api/djs/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import DJ from "@/models/DJ";
import Mix from "@/models/Mix";
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

    // Fetch DJ
    const dj = await DJ.findOne({ 
      slug: slug.toLowerCase() 
    }).lean();

    if (!dj) {
      return NextResponse.json({ error: "DJ not found" }, { status: 404 });
    }

    // Fetch Mixes (easy - direct djId)
    const mixes = await Mix.find({ 
      djId: dj._id 
    })
      .sort({ releaseDate: -1 })
      .lean();

    // Fetch Events where DJ is in the lineup
    const events = await Event.find({
      "lineup.dj": dj._id,
      status: "published"   // Only show published events
    })
      .sort({ date: -1 })
      .lean();

    // Return everything together
    return NextResponse.json({
      ...dj,
      mixes: mixes || [],
      events: events || []
    });

  } catch (error) {
    console.error("Single DJ API Error:", error);
    return NextResponse.json({ error: "Failed to fetch DJ data" }, { status: 500 });
  }
}
