import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import dbConnect from "@/lib/db"
import Mix from "@/models/Mix"

export async function GET() {
  try {
    await dbConnect()

    const mixes = await Mix.find()
      .populate("djId", "name slug")
      .sort({ releaseDate: -1 })

    return NextResponse.json(mixes)
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Failed to fetch mixes" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.user || !["admin"].includes(session.user.role)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    await dbConnect()

    const body = await req.json()

    const existingMix = await Mix.findOne({
      slug: body.slug,
    })

    if (existingMix) {
      return NextResponse.json(
        { error: "Mix slug already exists" },
        { status: 400 }
      )
    }

    const mix = await Mix.create({
      title: body.title,
      slug: body.slug,
      djId: body.djId,
      genre: body.genre,
      description: body.description,
      duration: body.duration,
      audioUrl: body.audioUrl,
      coverImage: body.coverImage,
      releaseDate: body.releaseDate,
      featured: body.featured || false,
      plays: 0,
    })

    return NextResponse.json(mix, { status: 201 })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Failed to create mix" },
      { status: 500 }
    )
  }
}
