import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import dbConnect from "@/lib/db"

import Schedule from "@/models/Schedule"

export async function GET() {
  try {
    await dbConnect()

    const schedule = await Schedule.findOne()
      .populate("slots.djId", "name slug image")
      .lean()

    return NextResponse.json(
      schedule || { slots: [] }
    )
  } catch (error) {
    console.error(
      "Get schedule error:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Failed to fetch schedule",
      },
      {
        status: 500,
      }
    )
  }
}

export async function PUT(
  req: NextRequest
) {
  const session = await auth()

  if (
    !session?.user ||
    !["admin"].includes(
      session.user.role
    )
  ) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    )
  }

  try {
    await dbConnect()

    const body = await req.json()

    const slots = body.slots || []

    const schedule =
      await Schedule.findOneAndUpdate(
        {},
        {
          slots,
        },
        {
          upsert: true,
          new: true,
        }
      )

    return NextResponse.json(
      schedule
    )
  } catch (error) {
    console.error(
      "Update schedule error:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Failed to update schedule",
      },
      {
        status: 500,
      }
    )
  }
}
