import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Schedule from "@/models/Schedule"

export async function GET() {
  try {
    await dbConnect()

    const schedules = await Schedule.find()
      .populate({
        path: "slots.djId",
        model: "DJ",
        select: "name slug image",
      })
      .lean()

    const formatted = schedules.map((schedule: any) => ({
      ...schedule,
      slots: schedule.slots.map((slot: any) => ({
        ...slot,
        djName: slot.djId?.name || null,
        djSlug: slot.djId?.slug || null,
        djImage: slot.djId?.image || null,
      })),
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    )
  }
}
