import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import TimelineEvent00 from "@/models/TimelineEvent00";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);

    const page = Math.max(
      1,
      Number.parseInt(searchParams.get("page") || "1", 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(
        1,
        Number.parseInt(searchParams.get("limit") || "30", 10) || 30
      )
    );

    const skip = (page - 1) * limit;

    const sort = {
      "start_date.year": 1 as const,
      "start_date.month": 1 as const,
      "start_date.day": 1 as const,
      "start_date.hour": 1 as const,
      "start_date.minute": 1 as const,
      "start_date.second": 1 as const,
      _id: 1 as const,
    };

    const [events, total] = await Promise.all([
      TimelineEvent00.find({})
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),

      TimelineEvent00.countDocuments({}),
    ]);

    return NextResponse.json({
      success: true,
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + events.length < total,
      },
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

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Event id is required" },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Event title is required" },
        { status: 400 }
      );
    }

    if (!start_date?.year) {
      return NextResponse.json(
        { success: false, error: "start_date.year is required" },
        { status: 400 }
      );
    }

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