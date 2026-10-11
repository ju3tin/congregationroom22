import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import TimelineEvent00 from "@/models/TimelineEvent00";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();

    const events = await TimelineEvent00.find({})
      .select("_id id start_date title media.type")
      .sort({
        "start_date.year": 1,
        "start_date.month": 1,
        "start_date.day": 1,
        "start_date.hour": 1,
        "start_date.minute": 1,
        "start_date.second": 1,
      })
      .lean();

    const index = events.map((event: any) => ({
      key: event.id || String(event._id),
      id: event.id || "",
      start_date: event.start_date,
      title: event.title,
      mediaType: event.media?.type || "other",
    }));

    return NextResponse.json({
      success: true,
      count: index.length,
      events: index,
    });
  } catch (error) {
    console.error("CR22 archive index error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load CR22 archive index",
      },
      { status: 500 }
    );
  }
}
