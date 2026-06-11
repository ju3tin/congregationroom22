"use server";

import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ticketTierSchema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
  quantity: z.number().min(1),
  maxPerOrder: z.number().min(1).max(20),
  salesStart: z.string(),
  salesEnd: z.string(),
});

const lineupSchema = z.object({
  dj: z.string().min(1, "DJ is required"),
  setTime: z.string().optional(),
  headline: z.boolean().optional(),
});

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(1, "Description is required"),
  venueName: z.string().min(1, "Venue name is required"),
  venueAddress: z.string().min(1, "Venue address is required"),
  venueCity: z.string().min(1, "Venue city is required"),
  date: z.string().min(1, "Date is required"),
  doors: z.string().min(1, "Doors time is required"),
  image: z.string().min(1, "Image URL is required"),
  status: z.enum(["draft", "published", "cancelled", "completed"]),
  ticketTiers: z.array(ticketTierSchema).min(1, "At least one ticket tier is required"),
  lineup: z.array(lineupSchema).default([]),
  featured: z.boolean().default(false),        // ← Added
});

async function validateAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return null;
  }
  return session;
}

function parseFormData(formData: FormData) {
  let ticketTiers = [];
  let lineup = [];

  try {
    const ticketTiersJson = formData.get("ticketTiers") as string;
    ticketTiers = ticketTiersJson ? JSON.parse(ticketTiersJson) : [];
  } catch {
    throw new Error("Invalid ticket tiers data");
  }

  try {
    const lineupJson = formData.get("lineup") as string;
    lineup = lineupJson ? JSON.parse(lineupJson) : [];
  } catch {
    throw new Error("Invalid lineup data");
  }

  const rawData = {
    title: formData.get("title") as string,
    slug: (formData.get("slug") as string).toLowerCase().trim().replace(/\s+/g, "-"),
    description: formData.get("description") as string,
    venueName: formData.get("venueName") as string,
    venueAddress: formData.get("venueAddress") as string,
    venueCity: formData.get("venueCity") as string,
    date: formData.get("date") as string,
    doors: formData.get("doors") as string,
    image: formData.get("image") as string,
    status: formData.get("status") as string,
    ticketTiers,
    lineup,
    featured: formData.get("featured") === "true",     // ← Added
  };

  const result = eventSchema.safeParse(rawData);
  if (!result.success) {
    throw new Error(result.error.errors[0].message);
  }
  return result.data;
}

function transformTicketTiers(tiers: any[], existingTiers?: any[]) {
  return tiers.map((tier) => {
    const existingTier = existingTiers?.find((t) => t.name === tier.name);
    return {
      ...tier,
      salesStart: new Date(tier.salesStart),
      salesEnd: new Date(tier.salesEnd),
      sold: existingTier?.sold ?? 0,
    };
  });
}

function transformLineup(lineup: any[]) {
  return lineup.map((item) => ({
    dj: item.dj,
    setTime: item.setTime ? new Date(item.setTime) : undefined,
    headline: item.headline ?? false,
  }));
}

export async function createEvent(formData: FormData) {
  const session = await validateAdmin();
  if (!session) return { error: "Unauthorized" };

  try {
    const data = parseFormData(formData);

    await dbConnect();

    const existingEvent = await Event.findOne({ slug: data.slug });
    if (existingEvent) {
      return { error: "An event with this slug already exists" };
    }

    await Event.create({
      title: data.title,
      slug: data.slug,
      description: data.description,
      venue: {
        name: data.venueName,
        address: data.venueAddress,
        city: data.venueCity,
      },
      date: new Date(data.date),
      doors: new Date(data.doors),
      image: data.image,
      status: data.status,
      organizerId: session.user.id,
      ticketTiers: transformTicketTiers(data.ticketTiers),
      lineup: transformLineup(data.lineup),
      featured: data.featured,                    // ← Added
    });

    revalidatePath("/admin/events");
    revalidatePath("/events");
    return { success: true };
  } catch (error) {
    console.error("Create event error:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to create event",
    };
  }
}

export async function updateEvent(eventId: string, formData: FormData) {
  const session = await validateAdmin();
  if (!session) return { error: "Unauthorized" };

  try {
    const data = parseFormData(formData);

    await dbConnect();

    const existingEvent = await Event.findOne({
      slug: data.slug,
      _id: { $ne: eventId },
    });
    if (existingEvent) {
      return { error: "An event with this slug already exists" };
    }

    await Event.findByIdAndUpdate(eventId, {
      title: data.title,
      slug: data.slug,
      description: data.description,
      venue: {
        name: data.venueName,
        address: data.venueAddress,
        city: data.venueCity,
      },
      date: new Date(data.date),
      doors: new Date(data.doors),
      image: data.image,
      status: data.status,
      ticketTiers: transformTicketTiers(data.ticketTiers),
      lineup: transformLineup(data.lineup),
      featured: data.featured,                    // ← Added
    });

    revalidatePath("/admin/events");
    revalidatePath("/events");
    revalidatePath(`/events/${data.slug}`);
    return { success: true };
  } catch (error) {
    console.error("Update event error:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to update event",
    };
  }
}

export async function deleteEvent(eventId: string) {
  const session = await validateAdmin();
  if (!session) return { error: "Unauthorized" };

  try {
    await dbConnect();
    const event = await Event.findById(eventId);
    if (!event) return { error: "Event not found" };

    await Event.findByIdAndDelete(eventId);

    revalidatePath("/admin/events");
    revalidatePath("/events");
    revalidatePath(`/events/${event.slug}`);
    return { success: true };
  } catch (error) {
    console.error("Delete event error:", error);
    return { error: "Failed to delete event" };
  }
}
