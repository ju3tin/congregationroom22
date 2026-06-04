import { NextRequest } from "next/server";
import { connectToDB } from "@/lib/mongodb"; // adjust path if needed
import Event from "@/models/Event"; // adjust path if needed

// GET - Fetch single event
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();
    const event = await Event.findById(params.id);

    if (!event) {
      return Response.json({ error: "Event not found" }, { status: 404 });
    }

    return Response.json(event);
  } catch (error) {
    console.error("Fetch event error:", error);
    return Response.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}

// PUT - Update event
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();

    const formData = await req.formData();
    const ticketTiersRaw = formData.get("ticketTiers") as string;

    const updateData = {
      title: formData.get("title"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      image: formData.get("image"),
      status: formData.get("status"),
      venueName: formData.get("venueName"),
      venueAddress: formData.get("venueAddress"),
      venueCity: formData.get("venueCity"),
      date: formData.get("date"),
      doors: formData.get("doors"),
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
    console.error("Update event error:", error);
    return Response.json(
      { error: error.message || "Failed to update event" },
      { status: 500 }
    );
  }
}
