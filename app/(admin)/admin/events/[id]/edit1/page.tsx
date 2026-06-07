import { notFound } from "next/navigation"
import dbConnect from "@/lib/db"
import Event from "@/models/Event"
import DJ from "@/models/DJ"
import EventEditForm from "./event-edit-form"

interface Props {
  params: Promise<{
    id: string
  }>
}

export default async function EditEventPage({
  params,
}: Props) {
  const { id } = await params

  await dbConnect()

  const event = await Event.findById(id).lean()

  if (!event) {
    notFound()
  }

  const djs = await DJ.find({})
    .select("_id name")
    .sort({ name: 1 })
    .lean()

  const serializedEvent = {
    ...event,
    _id: event._id.toString(),
    organizerId: event.organizerId.toString(),

    date: new Date(event.date)
      .toISOString()
      .slice(0, 16),

    doors: new Date(event.doors)
      .toISOString()
      .slice(0, 16),

    ticketTiers: event.ticketTiers.map(
      (tier: any) => ({
        ...tier,
        _id: tier._id.toString(),
        salesStart: new Date(
          tier.salesStart
        )
          .toISOString()
          .slice(0, 16),
        salesEnd: new Date(
          tier.salesEnd
        )
          .toISOString()
          .slice(0, 16),
      })
    ),

    lineup:
      event.lineup?.map((item: any) => ({
        dj:
          typeof item.dj === "object"
            ? item.dj.toString()
            : item.dj,

        setTime: item.setTime
          ? new Date(item.setTime)
              .toISOString()
              .slice(0, 16)
          : "",

        headline:
          item.headline ?? false,
      })) ?? [],
  }

  const serializedDjs = djs.map((dj) => ({
    _id: dj._id.toString(),
    name: dj.name,
  }))

  return (
    <EventEditForm
      event={serializedEvent}
      djs={serializedDjs}
    />
  )
}
