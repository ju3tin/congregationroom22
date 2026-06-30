"use server";

import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Mix from "@/models/Mix";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const mixSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  djId: z.string().min(1, "DJ is required"),
  genre: z.string().min(1, "Genre is required"),
  description: z.string().optional(),
  duration: z.coerce.number().min(1),
  audioUrl: z.string().min(1, "Audio URL is required"),
  coverImage: z.string().min(1, "Cover image is required"),
  releaseDate: z.string().min(1, "Release date is required"),
  featured: z.boolean().default(false),
});

// ====================== CREATE ======================
export async function createMix(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const result = mixSchema.safeParse({
    title: formData.get("title"),
    slug: String(formData.get("slug")).toLowerCase().trim().replace(/\s+/g, "-"),
    djId: formData.get("djId"),
    genre: formData.get("genre"),
    description: formData.get("description"),
    duration: formData.get("duration"),
    audioUrl: formData.get("audioUrl"),
    coverImage: formData.get("coverImage"),
    releaseDate: formData.get("releaseDate"),
    featured: formData.get("featured") === "true" || formData.get("featured") === "on",
  });

  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  try {
    await dbConnect();

    const existingMix = await Mix.findOne({ slug: result.data.slug });
    if (existingMix) return { error: "A mix with this slug already exists" };

    await Mix.create({
      ...result.data,
      releaseDate: new Date(result.data.releaseDate),
      plays: 0,
    });

    revalidatePath("/admin/mixes");
    revalidatePath("/mixes");
    return { success: true };
  } catch (error) {
    console.error("Create mix error:", error);
    return { error: "Failed to create mix" };
  }
}

// ====================== UPDATE ======================
export async function updateMix(mixId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const result = mixSchema.safeParse({
    title: formData.get("title"),
    slug: String(formData.get("slug")).toLowerCase().trim().replace(/\s+/g, "-"),
    djId: formData.get("djId"),
    genre: formData.get("genre"),
    description: formData.get("description"),
    duration: formData.get("duration"),
    audioUrl: formData.get("audioUrl"),
    coverImage: formData.get("coverImage"),
    releaseDate: formData.get("releaseDate"),
    featured: formData.get("featured") === "true" || formData.get("featured") === "on",
  });

  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  try {
    await dbConnect();

    const existingMix = await Mix.findOne({
      slug: result.data.slug,
      _id: { $ne: mixId },
    });
    if (existingMix) return { error: "A mix with this slug already exists" };

    await Mix.findByIdAndUpdate(mixId, {
      ...result.data,
      releaseDate: new Date(result.data.releaseDate),
    });

    revalidatePath("/admin/mixes");
    revalidatePath("/mixes");
    revalidatePath(`/mixes/${result.data.slug}`);
    return { success: true };
  } catch (error) {
    console.error("Update mix error:", error);
    return { error: "Failed to update mix" };
  }
}

// ====================== DELETE ======================
export async function deleteMix(mixId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  try {
    await dbConnect();
    await Mix.findByIdAndDelete(mixId);

    revalidatePath("/admin/mixes");
    revalidatePath("/mixes");
    return { success: true };
  } catch (error) {
    console.error("Delete mix error:", error);
    return { error: "Failed to delete mix" };
  }
}
