import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import DJ from "@/models/DJ"

export async function GET() {
  try {
    await connectDB()

    const djs = await DJ.find({})
      .sort({ name: 1 })
      .lean()

    return NextResponse.json(djs)
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Failed to fetch DJs" },
      { status: 500 }
    )
  }
}
