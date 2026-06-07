"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { Types } from "mongoose"
import Event from "@/models/Event"   // Adjust path if needed

// Helper to convert string IDs to ObjectId
function toObjectId(id: string) {
  return Types.ObjectId.createFromHexString(id)
}

// Create New Event
export async function createEvent(formData: FormData) {
  try {
    const title = formData.get("title") as string
    const slug = formData.get("slug") as string
    const description = formData.get("description") as string
    const image = formData.get("image") as string
    const status = formData.get("status") as string
    const venueName = formData.get("venueName") as string
    const venueAddress = formData.get("venueAddress") as string
    const venueCity = formData.get("venueCity") as string
    const date = formData.get("date") as string
    const doors = formData.get("doors") as string
    const endDate = formData.get("endDate") as string | null

    const ticketTiersRaw = formData.get("ticketTiers") as string
    const lineupRaw = formData.get("lineup") as string

    const ticketTiers = JSON.parse(ticketTiersRaw)
    const lineup = JSON.parse(lineupRaw)

    // Convert lineup DJ strings to ObjectIds
    const formattedLineup = lineup.map((item: any) => ({
      dj: toObjectId(item.dj),
      setTime: item.setTime ? new Date(item.setTime) : undefined,
      headline: item.headline || false,
    }))

    const newEvent = new Event({
      title,
      slug,
      description,
      venue: {
        name: venueName,
        address: venueAddress,
        city: venueCity,
      },
      date: new Date(date),
      doors: new Date(doors),
      endDate: endDate ? new Date(endDate) : undefined,
      image,
      organizerId: toObjectId("YOUR_USER_ID_HERE"), // Replace with actual logged-in user ID
      status: status || "draft",
      ticketTiers,
      lineup: formattedLineup,
    })

    await newEvent.save()

    revalidatePath("/admin/events")
    return { success: true }
  } catch (error: any) {
    console.error("Create Event Error:", error)
    return { 
      error: error.message || "Failed to create event" 
    }
  }
}

// Update Existing Event
export async function updateEvent(id: string, data: any) {
  try {
    if (!Types.ObjectId.isValid(id)) {
      return { error: "Invalid event ID" }
    }

    const {
      title,
      slug,
      description,
      venue,
      date,
      doors,
      endDate,
      image,
      status,
      ticketTiers,
      lineup,
    } = data

    // Format lineup
    const formattedLineup = lineup.map((item: any) => ({
      dj: toObjectId(item.dj),
      setTime: item.setTime ? new Date(item.setTime) : undefined,
      headline: item.headline || false,
    }))

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        title,
        slug,
        description,
        venue,
        date: new Date(date),
        doors: new Date(doors),
        endDate: endDate ? new Date(endDate) : undefined,
        image,
        status,
        ticketTiers,
        lineup: formattedLineup,
      },
      { new: true, runValidators: true }
    )

    if (!updatedEvent) {
      return { error: "Event not found" }
    }

    revalidatePath("/admin/events")
    revalidatePath(`/admin/events/${id}/edit`)

    return { success: true }
  } catch (error: any) {
    console.error("Update Event Error:", error)
    return { 
      error: error.message || "Failed to update event" 
    }
  }
}
