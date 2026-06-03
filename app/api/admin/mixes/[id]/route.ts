import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import dbConnect from "@/lib/db"
import Mix from "@/models/Mix"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    await dbConnect()

    const { id } = await params

    const mix = await Mix.findById(id)
      .populate("djId", "name slug")

    if (!mix) {
      return NextResponse.json(
        { error: "Mix not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(mix)
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Failed to fetch mix" },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: RouteParams
) {
  const session = await auth()

  if (!session?.user || !["admin"].includes(session.user.role)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    await dbConnect()

    const { id } = await params
    const body = await req.json()

    const existingMix = await Mix.findOne({
      slug: body.slug,
      _id: { $ne: id },
    })

    if (existingMix) {
      return NextResponse.json(
        { error: "Mix slug already exists" },
        { status: 400 }
      )
    }

    const mix = await Mix.findByIdAndUpdate(
      id,
      {
        title: body.title,
        slug: body.slug,
        djId: body.djId,
        genre: body.genre,
        description: body.description,
        duration: body.duration,
        audioUrl: body.audioUrl,
        coverImage: body.coverImage,
        releaseDate: body.releaseDate,
        featured: body.featured,
      },
      {
        new: true,
      }
    )

    if (!mix) {
      return NextResponse.json(
        { error: "Mix not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(mix)
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Failed to update mix" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
) {
  const session = await auth()

  if (!session?.user || !["admin"].includes(session.user.role)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    await dbConnect()

    const { id } = await params

    const mix = await Mix.findByIdAndDelete(id)

    if (!mix) {
      return NextResponse.json(
        { error: "Mix not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Failed to delete mix" },
      { status: 500 }
    )
  }
}
