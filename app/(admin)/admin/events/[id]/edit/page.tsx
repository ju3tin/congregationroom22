import { notFound } from "next/navigation";
import EventForm from "../EventForm";
import { getEvent } from "@app/actions/events"; // adjust path if needed
import dbConnect from "@/lib/db";
import DJ from "@/models/DJ";

async function getEventData(id: string) {
  await dbConnect();
  const event = await Event.findById(id).lean();
  if (!event) return null;

  const djs = await DJ.find().select("_id name").lean();

  return {
    event: {
      _id: event._id.toString(),
      title: event.title,
      slug: event.slug,
      description: event.description,
      image: event.image,
      status: event.status,
      venueName: event.venue.name,
      venueAddress: event.venue.address,
      venueCity: event.venue.city,
      date: event.date.toISOString(),
      doors: event.doors.toISOString(),
      ticketTiers: event.ticketTiers || [],
      lineup: event.lineup || [],
      featured: event.featured || false,
    },
    djs: djs.map((dj: any) => ({
      _id: dj._id.toString(),
      name: dj.name,
    })),
  };
}

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const data = await getEventData(params.id);

  if (!data) {
    notFound();
  }

  return <EventForm djs={data.djs} event={data.event} action={updateEvent} />;
}
