import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import dbConnect from "@/lib/db";
import TimelineEvent00 from "@/models/TimelineEvent00";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get("key")?.trim();

    if (!key) {
      return NextResponse.json(
        { success: false, error: "Event key is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // First try the event's custom ID, such as "12321313".
    let event = await TimelineEvent00.findOne({ id: key }).lean();

    // If no custom ID matches, try MongoDB's document ID.
    if (!event && mongoose.Types.ObjectId.isValid(key)) {
      event = await TimelineEvent00.findById(key).lean();
    }

    if (!event) {
      return NextResponse.json(
        { success: false, error: `Archive event not found: ${key}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("CR22 archive event API error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to load archive event" },
      { status: 500 }
    );
  }
}
