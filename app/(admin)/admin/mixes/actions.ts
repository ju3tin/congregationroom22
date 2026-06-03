"use server"

import { auth } from "@/lib/auth"
import dbConnect from "@/lib/db"
import Mix from "@/models/Mix"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const mixSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  djId: z.string().min(1),
  genre: z.string().min(1),

  description: z.string().optional(),

  duration: z.coerce.number(),

  audioUrl: z.string().min(1),
  coverImage: z.string().min(1),

  releaseDate: z.string(),

  featured: z.boolean().optional(),
})

export async function createMix(
  formData: FormData
) {
  const session = await auth()

  if (
    !session?.user?.id ||
    session.user.role !== "admin"
  ) {
    return { error: "Unauthorized" }
  }

  const result = mixSchema.safeParse({
    title: formData.get("title"),
    slug: String(formData.get("slug"))
      .toLowerCase()
      .replace(/\s+/g, "-"),
    djId: formData.get("djId"),
    genre: formData.get("genre"),
    description: formData.get("description"),
    duration: formData.get("duration"),
    audioUrl: formData.get("audioUrl"),
    coverImage: formData.get("coverImage"),
    releaseDate: formData.get("releaseDate"),
    featured: formData.get("featured") === "on",
  })

  if (!result.success) {
    return {
      error: result.error.errors[0].message,
    }
  }

  await dbConnect()

  await Mix.create({
    ...result.data,
    releaseDate: new Date(
      result.data.releaseDate
    ),
    plays: 0,
  })

  revalidatePath("/admin/mixes")
  revalidatePath("/mixes")

  return { success: true }
}

export async function updateMix(
  mixId: string,
  formData: FormData
) {
  const session = await auth()

  if (
    !session?.user?.id ||
    session.user.role !== "admin"
  ) {
    return { error: "Unauthorized" }
  }

  const result = mixSchema.safeParse({
    title: formData.get("title"),
    slug: String(formData.get("slug"))
      .toLowerCase()
      .replace(/\s+/g, "-"),
    djId: formData.get("djId"),
    genre: formData.get("genre"),
    description: formData.get("description"),
    duration: formData.get("duration"),
    audioUrl: formData.get("audioUrl"),
    coverImage: formData.get("coverImage"),
    releaseDate: formData.get("releaseDate"),
    featured: formData.get("featured") === "on",
  })

  if (!result.success) {
    return {
      error: result.error.errors[0].message,
    }
  }

  await dbConnect()

  await Mix.findByIdAndUpdate(
    mixId,
    {
      ...result.data,
      releaseDate: new Date(
        result.data.releaseDate
      ),
    }
  )

  revalidatePath("/admin/mixes")
  revalidatePath("/mixes")

  return { success: true }
}

export async function deleteMix(
  mixId: string
) {
  const session = await auth()

  if (
    !session?.user?.id ||
    session.user.role !== "admin"
  ) {
    return { error: "Unauthorized" }
  }

  await dbConnect()

  await Mix.findByIdAndDelete(mixId)

  revalidatePath("/admin/mixes")
  revalidatePath("/mixes")

  return { success: true }
}