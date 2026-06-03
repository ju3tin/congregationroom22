import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import DJ from "@/models/DJ"
import { getAuthUser } from '@/lib/auth1';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();

    if (!user || !["admin"].includes(user.role)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    await connectDB()

    const { searchParams } = new URL(req.url)

    const id = searchParams.get("id")
    const slug = searchParams.get("slug")

    // Get single DJ by ID
    if (id) {
      const dj = await DJ.findById(id)

      if (!dj) {
        return NextResponse.json(
          { error: "DJ not found" },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        dj,
      })
    }

    // Get single DJ by slug
    if (slug) {
      const dj = await DJ.findOne({ slug })

      if (!dj) {
        return NextResponse.json(
          { error: "DJ not found" },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        dj,
      })
    }

    // Get all DJs
    const djs = await DJ.find({})
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      count: djs.length,
      djs,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Failed to fetch DJs" },
      { status: 500 }
    )
  }
}
