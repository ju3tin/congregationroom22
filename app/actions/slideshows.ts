"use server";

import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Slideshow from "@/models/Slideshow";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const slideSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  image: z.string().optional(),
  background: z.string().optional(),
  transition: z.string().default("slide"),
  notes: z.string().optional(),
  timer: z.number().default(0),
});

const slideshowSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  slides: z.array(slideSchema).min(1),
  theme: z.string().default("black"),
  isPublic: z.boolean().default(true),
  featured: z.boolean().default(false),
});

export async function createSlideshow(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const slidesJson = formData.get("slides") as string;

  let slides;
  try {
    slides = JSON.parse(slidesJson || "[]");
  } catch {
    return { error: "Invalid slides data" };
  }

  const rawData = {
    title: formData.get("title") as string,
    slug: (formData.get("slug") as string).toLowerCase().trim().replace(/\s+/g, "-"),
    description: formData.get("description") as string,
    slides,
    theme: formData.get("theme") as string || "black",
    isPublic: formData.get("isPublic") === "true",
    featured: formData.get("featured") === "true",
  };

  const result = slideshowSchema.safeParse(rawData);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  try {
    await dbConnect();

    const existing = await Slideshow.findOne({ slug: result.data.slug });
    if (existing) return { error: "Slug already exists" };

    await Slideshow.create(result.data);

    revalidatePath("/admin/slideshows");
    revalidatePath("/slideshows");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create slideshow" };
  }
}

// Add update, delete, get as needed
