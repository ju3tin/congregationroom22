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

  duration: z.coerce.number().min(1),

  audioUrl: z.string().url(),
  coverImage: z.string().url(),

  releaseDate: z.string(),

  featured: z.boolean(),
})
