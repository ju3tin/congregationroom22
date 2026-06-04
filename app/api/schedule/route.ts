import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Schedule from "@/models/Schedule"

export async function GET() {
  try {
    await dbConnect()

    const schedule = await Schedule.find()
      .sort({ startTime: 1 })
      .lean()

    return NextResponse.json(schedule)
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    )
  }
}
