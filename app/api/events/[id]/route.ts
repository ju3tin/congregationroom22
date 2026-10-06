import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import Event from "@/models/Event";

// GET /api/events/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate MongoDB ObjectId
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid Event ID" },
        { status: 400 }
      );
    }

    // Find event and populate DJ information
    const event = await Event.findById(id)
      .populate({
        path: "lineup.dj",
        select: "name _id",
        model: "DJ",
      })
      .lean();

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(event, {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching event:", error);

    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate MongoDB ObjectId
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid Event ID" },
        { status: 400 }
      );
    }

    // Find the event first
    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Delete the event
    await Event.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: "Event deleted successfully",
        event: {
          _id: event._id,
          title: event.title,
          slug: event.slug,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting event:", error);

    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}