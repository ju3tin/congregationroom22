"use server"

import { auth } from "@/lib/auth"
import dbConnect from "@/lib/db"
import Schedule from "@/models/Schedule"

import { revalidatePath } from "next/cache"

interface ScheduleSlot {
  dayOfWeek: number
  startTime: string
  endTime: string
  djId: string
  showName: string
}

export async function saveSchedule(
  slots: ScheduleSlot[]
) {
  const session = await auth()

  if (
    !session?.user ||
    session.user.role !== "admin"
  ) {
    return {
      error: "Unauthorized",
    }
  }

  try {
    await dbConnect()

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

    revalidatePath("/admin/schedule")
    revalidatePath("/schedule")

    return {
      success: true,
    }
  } catch (error) {
    console.error(
      "Save schedule error:",
      error
    )

    return {
      error:
        "Failed to save schedule",
    }
  }
}
