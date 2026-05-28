"use server";

import dbConnect from "@/lib/db";
import { Page, SiteSettings } from "@/models";
import { auth } from "@/lib/auth";
import { revalidateTag } from "next/cache";

export async function createPage(formData: FormData) {
  const session = await auth();
  if (!session?.user || !["admin"].includes(session.user.role as string)) {
    return { error: "Unauthorized" };
  }

  await dbConnect();

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const content = formData.get("content") as string;
  const isPublished = formData.get("isPublished") === "true";

  try {
    const page = await Page.create({
      title,
      slug,
      content,
      isPublished,
    });

    revalidateTag("pages", "max");
    return { success: true, page: JSON.parse(JSON.stringify(page)) };
  } catch (error: unknown) {
    const err = error as { code?: number; message?: string };
    if (err.code === 11000) {
      return { error: "A page with this slug already exists" };
    }
    return { error: err.message || "Failed to create page" };
  }
}

export async function updatePage(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user || !["admin"].includes(session.user.role as string)) {
    return { error: "Unauthorized" };
  }

  await dbConnect();

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const content = formData.get("content") as string;
  const isPublished = formData.get("isPublished") === "true";

  try {
    const page = await Page.findByIdAndUpdate(
      id,
      { title, slug, content, isPublished },
      { new: true }
    );

    if (!page) {
      return { error: "Page not found" };
    }

    revalidateTag("pages", "max");
    return { success: true, page: JSON.parse(JSON.stringify(page)) };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return { error: err.message || "Failed to update page" };
  }
}

export async function deletePage(id: string) {
  const session = await auth();
  if (!session?.user || !["admin"].includes(session.user.role as string)) {
    return { error: "Unauthorized" };
  }

  await dbConnect();

  try {
    await Page.findByIdAndDelete(id);
    revalidateTag("pages", "max");
    return { success: true };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return { error: err.message || "Failed to delete page" };
  }
}

export async function updateSiteSettings(formData: FormData) {
  const session = await auth();
  if (!session?.user || !["admin"].includes(session.user.role as string)) {
    return { error: "Unauthorized" };
  }

  await dbConnect();

  const siteName = formData.get("siteName") as string;
  const siteDescription = formData.get("siteDescription") as string;
  const heroTitle = formData.get("heroTitle") as string;
  const heroSubtitle = formData.get("heroSubtitle") as string;
  const contactEmail = formData.get("contactEmail") as string;
  const socialLinks = {
    twitter: formData.get("twitter") as string,
    instagram: formData.get("instagram") as string,
    facebook: formData.get("facebook") as string,
  };

  try {
    const settings = await SiteSettings.findOneAndUpdate(
      {},
      {
        siteName,
        siteDescription,
        heroTitle,
        heroSubtitle,
        contactEmail,
        socialLinks,
      },
      { upsert: true, new: true }
    );

    revalidateTag("settings", "max");
    return { success: true, settings: JSON.parse(JSON.stringify(settings)) };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return { error: err.message || "Failed to update settings" };
  }
}
