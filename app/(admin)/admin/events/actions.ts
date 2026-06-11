"use server";

import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ticketTierSchema = z.object({
  name: z.string().min(1, "Tier name is required"),
  price: z.number().min(0),
  quantity: z.number().min(1),
  maxPerOrder: z.number().min(1).max(20),
  salesStart: z.string().min(1),
  salesEnd: z.string().min(1),
});

const lineupSchema = z.object({
  dj: z.string().min(1, "DJ is required"),
  setTime: z.string().optional(),
  headline: z.boolean().default(false),
});

const eventSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  venueName: z.string().min(1),
  venueAddress: z.string().min(1),
  venueCity: z.string().min(1),
  date: z.string().min(1),
  doors: z.string().min(1),
  endDate: z.string().optional(),
  image: z.string().min(1),
  ticketTiers: z.array(ticketTierSchema).min(1),
  lineup: z.array(lineupSchema).default([]),
  featured: z.boolean().default(false),
});

async function validateAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}

function parseFormData(formData: FormData) {
  let ticketTiers: any[] = [];
  let lineup: any[] = [];

  try {
    const tt = formData.get("ticketTiers") as string;
    ticketTiers = tt ? JSON.parse(tt) : [];
  } catch (e) {
    throw new Error("Invalid ticket tiers data");
  }

  try {
    const lu = formData.get("lineup") as string;
    lineup = lu ? JSON.parse(lu) : [];
  } catch (e) {
    throw new Error("Invalid lineup data");
  }

  const rawData = {
    title: formData.get("title") as string,
    slug: (formData.get("slug") as string)?.toLowerCase().trim().replace(/\s+/g, "-"),
    description: formData.get("description") as string,
    venueName: formData.get("venueName") as string,
    venueAddress: formData.get("venueAddress") as string,
    venueCity: formData.get("venueCity") as string,
    date: formData.get("date") as string,
    doors: formData.get("doors") as string,
    endDate: formData.get("endDate") as string | null,
    image: formData.get("image") as string,
    ticketTiers,
    lineup,
    featured: formData.get("featured") === "true",
  };

  const result = eventSchema.safeParse(rawData);
  if (!result.success) {
    throw new Error(result.error.errors[0]?.message || "Validation failed");
  }

  return result.data;
}

function transformTicketTiers(tiers: any[]) {
  return tiers.map((tier) => ({
    name: tier.name,
    price: tier.price,
    quantity: tier.quantity,
    maxPerOrder: tier.maxPerOrder,
    salesStart: new Date(tier.salesStart),
    salesEnd: new Date(tier.salesEnd),
    sold: 0,
  }));
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

  try {
    const data = parseFormData(formData);
    await dbConnect();

    const existing = await Event.findOne({ slug: data.slug });
    if (existing) return { error: "An event with this slug already exists" };

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
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      image: data.image,
      status: "draft",
      organizerId: session.user.id,
      ticketTiers: transformTicketTiers(data.ticketTiers),
      lineup: transformLineup(data.lineup),
      featured: data.featured,
    });

    revalidatePath("/admin/events");
    revalidatePath("/events");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Create event error:", error);
    return { error: error.message || "Failed to create event" };
  }
}

export async function updateEvent(eventId: string, formData: FormData) {
  const session = await validateAdmin();

  try {
    const data = parseFormData(formData);
    await dbConnect();

    const existing = await Event.findOne({
      slug: data.slug,
      _id: { $ne: eventId },
    });
    if (existing) return { error: "An event with this slug already exists" };

    const updated = await Event.findByIdAndUpdate(
      eventId,
      {
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
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        image: data.image,
        ticketTiers: transformTicketTiers(data.ticketTiers),
        lineup: transformLineup(data.lineup),
        featured: data.featured,
      },
      { new: true }
    );

    if (!updated) return { error: "Event not found" };

    revalidatePath("/admin/events");
    revalidatePath("/events");
    revalidatePath(`/events/${data.slug}`);

    return { success: true };
  } catch (error: any) {
    console.error("Update event error:", error);
    return { error: error.message || "Failed to update event" };
  }
}

export async function deleteEvent(eventId: string) {
  const session = await validateAdmin();

  try {
    await dbConnect();
    const event = await Event.findByIdAndDelete(eventId);
    if (!event) return { error: "Event not found" };

    revalidatePath("/admin/events");
    revalidatePath("/events");

    return { success: true };
  } catch (error: any) {
    return { error: "Failed to delete event" };
  }
}
