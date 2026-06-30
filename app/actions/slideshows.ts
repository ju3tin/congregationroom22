"use server";

import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Slideshow from "@/models/Slideshow";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const slideSchema = z.object({
  title: z.string().min(1, "Slide title is required"),
  content: z.string().min(1, "Slide content is required"),
  image: z.string().optional(),
  background: z.string().optional(),
  transition: z.string().default("slide"),
  notes: z.string().optional(),
  timer: z.number().min(0).default(0),
});

const slideshowSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  slides: z.array(slideSchema).min(1, "At least one slide is required"),
  theme: z.string().default("black"),
  isPublic: z.boolean().default(true),
  featured: z.boolean().default(false),
});

// ====================== GET ALL ======================
export async function getSlideshows() {
  try {
    await dbConnect();
    const slideshows = await Slideshow.find().sort({ createdAt: -1 }).lean();
    return slideshows.map((s: any) => ({
      ...s,
      _id: s._id.toString(),
    }));
  } catch (error) {
    console.error("Get slideshows error:", error);
    return [];
  }
}

// ====================== GET ONE ======================
export async function getSlideshow(id: string) {
  try {
    await dbConnect();
    const slideshow = await Slideshow.findById(id).lean();
    if (!slideshow) return null;
    return {
      ...slideshow,
      _id: slideshow._id.toString(),
    };
  } catch (error) {
    console.error("Get slideshow error:", error);
    return null;
  }
}

// ====================== CREATE ======================
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
    if (existing) return { error: "A slideshow with this slug already exists" };

    await Slideshow.create(result.data);

    revalidatePath("/admin/slideshows");
    revalidatePath("/slideshows");
    return { success: true };
  } catch (error) {
    console.error("Create slideshow error:", error);
    return { error: "Failed to create slideshow" };
  }
}

// ====================== UPDATE ======================
export async function updateSlideshow(id: string, formData: FormData) {
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

    const existing = await Slideshow.findOne({
      slug: result.data.slug,
      _id: { $ne: id },
    });
    if (existing) return { error: "A slideshow with this slug already exists" };

    await Slideshow.findByIdAndUpdate(id, result.data);

    revalidatePath("/admin/slideshows");
    revalidatePath("/slideshows");
    revalidatePath(`/slideshows/${result.data.slug}`);
    return { success: true };
  } catch (error) {
    console.error("Update slideshow error:", error);
    return { error: "Failed to update slideshow" };
  }
}

// ====================== DELETE ======================
export async function deleteSlideshow(id: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  try {
    await dbConnect();
    await Slideshow.findByIdAndDelete(id);
    revalidatePath("/admin/slideshows");
    revalidatePath("/slideshows");
    return { success: true };
  } catch (error) {
    console.error("Delete slideshow error:", error);
    return { error: "Failed to delete slideshow" };
  }
}
