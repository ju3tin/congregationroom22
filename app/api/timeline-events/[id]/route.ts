import { NextRequest, NextResponse } from "next/server";

import dbConnect from "@/lib/db";
import TimelineEvent from "@/models/TimelineEvent00";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/timeline-events/[id]
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    await dbConnect();

    const event = await TimelineEvent.findOne({
      id,
    }).lean();

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: "Timeline event not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error(
      "Error fetching timeline event:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch timeline event",
      },
      {
        status: 500,
      }
    );
  }
}

// PUT /api/timeline-events/[id]
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    await dbConnect();

    const body = await request.json();

    const {
      start_date,
      end_date,
      title,
      text,
      group,
      background,
      media,
    } = body;

    const event =
      await TimelineEvent.findOneAndUpdate(
        { id },
        {
          start_date,
          end_date,
          title,
          text,
          group,
          background,
          media,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: "Timeline event not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Timeline event updated successfully",
      event,
    });
  } catch (error) {
    console.error(
      "Error updating timeline event:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update timeline event",
      },
      {
        status: 500,
      }
    );
  }
}

// DELETE /api/timeline-events/[id]
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    await dbConnect();

    const event =
      await TimelineEvent.findOneAndDelete({
        id,
      });

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: "Timeline event not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Timeline event deleted successfully",
      event: {
        id: event.id,
        title: event.title,
      },
    });
  } catch (error) {
    console.error(
      "Error deleting timeline event:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete timeline event",
      },
      {
        status: 500,
      }
    );
  }
}