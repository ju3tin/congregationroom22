"use server"

export async function saveSchedule(
  slots: any[]
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

  revalidatePath("/schedule")
  revalidatePath("/admin/schedule")

  return {
    success: true,
  }
}
