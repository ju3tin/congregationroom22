"use server"

import { auth } from "@/lib/auth"
import dbConnect from "@/lib/db"
import Event from "@/models/Event"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const ticketTierSchema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
  quantity: z.number().min(1),
  maxPerOrder: z.number().min(1).max(20),
  salesStart: z.string(),
  salesEnd: z.string(),
})

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
})

export async function createEvent(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "admin") {
    return { error: "Unauthorized" }
  }

  const ticketTiersJson = formData.get("ticketTiers") as string
  let ticketTiers
  try {
    ticketTiers = JSON.parse(ticketTiersJson)
  } catch {
    return { error: "Invalid ticket tiers data" }
  }

  const rawData = {
    title: formData.get("title") as string,
    slug: (formData.get("slug") as string).toLowerCase().replace(/\s+/g, "-"),
    description: formData.get("description") as string,
    venueName: formData.get("venueName") as string,
    venueAddress: formData.get("venueAddress") as string,
    venueCity: formData.get("venueCity") as string,
    date: formData.get("date") as string,
    doors: formData.get("doors") as string,
    image: formData.get("image") as string,
    status: formData.get("status") as string,
    ticketTiers,
  }

  const result = eventSchema.safeParse(rawData)
  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  try {
    await dbConnect()

    const existingEvent = await Event.findOne({ slug: result.data.slug })
    if (existingEvent) {
      return { error: "An event with this slug already exists" }
    }

    await Event.create({
      title: result.data.title,
      slug: result.data.slug,
      description: result.data.description,
      venue: {
        name: result.data.venueName,
        address: result.data.venueAddress,
        city: result.data.venueCity,
      },
      date: new Date(result.data.date),
      doors: new Date(result.data.doors),
      image: result.data.image,
      status: result.data.status,
      organizerId: session.user.id,
      ticketTiers: result.data.ticketTiers.map((tier) => ({
        ...tier,
        salesStart: new Date(tier.salesStart),
        salesEnd: new Date(tier.salesEnd),
        sold: 0,
      })),
    })

    revalidatePath("/admin/events")
    revalidatePath("/events")
    return { success: true }
  } catch (error) {
    console.error("Create event error:", error)
    return { error: "Failed to create event" }
  }
}

export async function updateEvent(eventId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "admin") {
    return { error: "Unauthorized" }
  }

  const ticketTiersJson = formData.get("ticketTiers") as string
  let ticketTiers
  try {
    ticketTiers = JSON.parse(ticketTiersJson)
  } catch {
    return { error: "Invalid ticket tiers data" }
  }

  const rawData = {
    title: formData.get("title") as string,
    slug: (formData.get("slug") as string).toLowerCase().replace(/\s+/g, "-"),
    description: formData.get("description") as string,
    venueName: formData.get("venueName") as string,
    venueAddress: formData.get("venueAddress") as string,
    venueCity: formData.get("venueCity") as string,
    date: formData.get("date") as string,
    doors: formData.get("doors") as string,
    image: formData.get("image") as string,
    status: formData.get("status") as string,
    ticketTiers,
  }

  const result = eventSchema.safeParse(rawData)
  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  try {
    await dbConnect()

    const existingEvent = await Event.findOne({
      slug: result.data.slug,
      _id: { $ne: eventId },
    })
    if (existingEvent) {
      return { error: "An event with this slug already exists" }
    }

    const event = await Event.findById(eventId)
    if (!event) {
      return { error: "Event not found" }
    }

    // Preserve sold counts for existing tiers
    const updatedTiers = result.data.ticketTiers.map((tier) => {
      const existingTier = event.ticketTiers.find(
        (t: { name: string }) => t.name === tier.name
      )
      return {
        ...tier,
        salesStart: new Date(tier.salesStart),
        salesEnd: new Date(tier.salesEnd),
        sold: existingTier?.sold || 0,
      }
    })

    await Event.findByIdAndUpdate(eventId, {
      title: result.data.title,
      slug: result.data.slug,
      description: result.data.description,
      venue: {
        name: result.data.venueName,
        address: result.data.venueAddress,
        city: result.data.venueCity,
      },
      date: new Date(result.data.date),
      doors: new Date(result.data.doors),
      image: result.data.image,
      status: result.data.status,
      ticketTiers: updatedTiers,
    })

    revalidatePath("/admin/events")
    revalidatePath("/events")
    revalidatePath(`/events/${result.data.slug}`)
    return { success: true }
  } catch (error) {
    console.error("Update event error:", error)
    return { error: "Failed to update event" }
  }
}

export async function deleteEvent(eventId: string) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "admin") {
    return { error: "Unauthorized" }
  }

  try {
    await dbConnect()
    await Event.findByIdAndDelete(eventId)

    revalidatePath("/admin/events")
    revalidatePath("/events")
    return { success: true }
  } catch (error) {
    console.error("Delete event error:", error)
    return { error: "Failed to delete event" }
  }
}
