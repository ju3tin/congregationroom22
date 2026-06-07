// app/api/djs/route.ts
import { NextResponse } from "next/server"
import DJ from "@/models/DJ"   // adjust path as needed

export async function GET() {
  try {
    const djs = await DJ.find({}).select("name _id").sort({ name: 1 })
    return NextResponse.json(djs)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch DJs" }, { status: 500 })
  }
}
