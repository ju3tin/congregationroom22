import { NextRequest } from "next/server";
import dbConnect from "@/lib/db" // ← adjust path if needed
import Event from "@/models/Event";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const event = await Event.findById(params.id).lean();

    if (!event) {
      return Response.json({ error: "Event not found" }, { status: 404 });
    }

    return Response.json(event);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();

    const formData = await req.formData();
    const ticketTiersRaw = formData.get("ticketTiers") as string;

    const updateData: any = {
      title: formData.get("title"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      image: formData.get("image"),
      status: formData.get("status"),
      date: formData.get("date"),
      doors: formData.get("doors"),
      "venue.name": formData.get("venueName"),
      "venue.address": formData.get("venueAddress"),
      "venue.city": formData.get("venueCity"),
      ticketTiers: ticketTiersRaw ? JSON.parse(ticketTiersRaw) : [],
    };

    const event = await Event.findByIdAndUpdate(params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return Response.json({ error: "Event not found" }, { status: 404 });
    }

    return Response.json({ success: true, event });
  } catch (error: any) {
    console.error("Update error:", error);
    return Response.json({ error: error.message || "Failed to update event" }, { status: 500 });
  }
}
