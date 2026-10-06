import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import TimelineEvent00 from "@/models/TimelineEvent00";

export async function GET() {
  try {
    await dbConnect();

    const events = await TimelineEvent00.find({})
      .sort({
        "start_date.year": 1,
        "start_date.month": 1,
        "start_date.day": 1,
        "start_date.hour": 1,
        "start_date.minute": 1,
        "start_date.second": 1,
      })
      .lean();

    return NextResponse.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("Error fetching timeline events:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch timeline events",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    const {
      id,
      start_date,
      end_date,
      title,
      text,
      group,
      background,
      media,
    } = body;

    // Required fields
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Event id is required",
        },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          error: "Event title is required",
        },
        { status: 400 }
      );
    }

    if (!start_date) {
      return NextResponse.json(
        {
          success: false,
          error: "start_date is required",
        },
        { status: 400 }
      );
    }

    if (!start_date.year) {
      return NextResponse.json(
        {
          success: false,
          error: "start_date.year is required",
        },
        { status: 400 }
      );
    }

    // Check duplicate ID
    const existing = await TimelineEvent00.findOne({ id });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "An event with this id already exists",
        },
        { status: 409 }
      );
    }

    // Create event
    const event = await TimelineEvent00.create({
      id,
      start_date,
      end_date,
      title,
      text,
      group,
      background,
      media,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Timeline event created successfully",
        event,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating timeline event:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create timeline event",
      },
      { status: 500 }
    );
  }
}