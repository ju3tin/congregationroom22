import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import DJ from "@/models/DJ";
import Mix from "@/models/Mix";
import Event from "@/models/Event";
import Schedule from "@/models/Schedule";

// Convert Mixcloud website URLs to API URLs
function normalizeMixcloudUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);

    if (
      parsedUrl.hostname === "www.mixcloud.com" ||
      parsedUrl.hostname === "mixcloud.com"
    ) {
      parsedUrl.hostname = "api.mixcloud.com";
    }

    return parsedUrl.toString();
  } catch {
    return url;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();

    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    // Fetch DJ by slug
    const dj = await DJ.findOne({
      slug: slug.toLowerCase(),
    }).lean();

    if (!dj) {
      return NextResponse.json(
        { error: "DJ not found" },
        { status: 404 }
      );
    }

    // Escape DJ name so special regex characters are treated literally
    const escapedName = dj.name.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    // Find mixes linked by djId OR containing the DJ name in the title
    const mixes = await Mix.find({
      $or: [
        { djId: dj._id },
        {
          title: {
            $regex: escapedName,
            $options: "i",
          },
        },
      ],
    })
      .sort({ releaseDate: -1 })
      .lean();

    // Format mixes and normalize Mixcloud URLs
    const formattedMixes = mixes.map((mix: any) => ({
      ...mix,
      _id: mix._id.toString(),
      djId: mix.djId?.toString(),
      audioUrl:
        mix.type === "mixcloud" &&
        typeof mix.audioUrl === "string"
          ? normalizeMixcloudUrl(mix.audioUrl)
          : mix.audioUrl,
    }));

    // Fetch schedule document containing this DJ's slots
    const scheduleDoc = await Schedule.findOne({
      "slots.djId": dj._id,
    }).lean();

    // Return only slots belonging to this DJ
    const schedule = (scheduleDoc?.slots || []).filter(
      (slot: any) =>
        slot.djId?.toString() === dj._id.toString()
    );

    // Fetch published events featuring this DJ
    const events = await Event.find({
      "lineup.dj": dj._id,
      status: "published",
    })
      .sort({ date: 1 })
      .lean();

    // Return DJ and related data
    return NextResponse.json({
      ...dj,
      _id: dj._id.toString(),
      mixes: formattedMixes,
      events: Array.isArray(events) ? events : [],
      schedule: Array.isArray(schedule) ? schedule : [],
    });
  } catch (error) {
    console.error("Single DJ API Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch DJ data" },
      { status: 500 }
    );
  }
} 