// app/api/events/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import Event from "@/models/Event"   // Adjust path to your Event model
import { Types } from "mongoose"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid Event ID" }, { status: 400 })
    }

    const event = await Event.findById(id)
      .populate({
        path: "lineup.dj",
        select: "name _id",   // Populate DJ name for display
        model: "DJ"
      })
      .lean()

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    )
  }
}
