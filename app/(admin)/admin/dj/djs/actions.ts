"use server";

import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import DJ from "@/models/DJ";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ====================== SCHEMA ======================
const djSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  genre: z.string().min(1, "Genre is required"),
  bio: z.string().min(1, "Bio is required"),
  image: z.string().min(1, "Image is required"),
  featured: z.boolean().default(false),
  socialLinks: z.object({
    instagram: z.string().optional(),
    soundcloud: z.string().optional(),
    twitter: z.string().optional(),
  }).default({}),
});

export async function createDJ(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const rawData = {
    name: formData.get("name") as string,
    slug: (formData.get("slug") as string).toLowerCase().replace(/\s+/g, "-"),
    genre: formData.get("genre") as string,
    bio: formData.get("bio") as string,
    image: formData.get("image") as string,
    featured: formData.get("featured") === "true",
    socialLinks: {
      instagram: (formData.get("instagram") as string) || "",
      soundcloud: (formData.get("soundcloud") as string) || "",
      twitter: (formData.get("twitter") as string) || "",
    },
  };

  const result = djSchema.safeParse(rawData);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  try {
    await dbConnect();

    const existingDJ = await DJ.findOne({ slug: result.data.slug });
    if (existingDJ) {
      return { error: "A DJ with this slug already exists" };
    }

    await DJ.create(result.data);

    revalidatePath("/admin/djs");
    revalidatePath("/djs");
    return { success: true };
  } catch (error) {
    console.error("Create DJ error:", error);
    return { error: "Failed to create DJ" };
  }
}

export async function updateDJ(djId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const rawData = {
    name: formData.get("name") as string,
    slug: (formData.get("slug") as string).toLowerCase().replace(/\s+/g, "-"),
    genre: formData.get("genre") as string,
    bio: formData.get("bio") as string,
    image: formData.get("image") as string,
    featured: formData.get("featured") === "true",
    socialLinks: {
      instagram: (formData.get("instagram") as string) || "",
      soundcloud: (formData.get("soundcloud") as string) || "",
      twitter: (formData.get("twitter") as string) || "",
    },
  };

  const result = djSchema.safeParse(rawData);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  try {
    await dbConnect();

    const existingDJ = await DJ.findOne({
      slug: result.data.slug,
      _id: { $ne: djId },
    });
    if (existingDJ) {
      return { error: "A DJ with this slug already exists" };
    }

    await DJ.findByIdAndUpdate(djId, result.data);

    revalidatePath("/admin/djs");
    revalidatePath("/djs");
    revalidatePath(`/djs/${result.data.slug}`);

    return { success: true };
  } catch (error) {
    console.error("Update DJ error:", error);
    return { error: "Failed to update DJ" };
  }
}

export async function deleteDJ(djId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  try {
    await dbConnect();
    await DJ.findByIdAndDelete(djId);
    revalidatePath("/admin/djs");
    revalidatePath("/djs");
    return { success: true };
  } catch (error) {
    console.error("Delete DJ error:", error);
    return { error: "Failed to delete DJ" };
  }
}
