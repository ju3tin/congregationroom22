import { notFound } from "next/navigation"
import dbConnect from "@/lib/db"
import Event from "@/models/Event"
import EditEventForm from "./EditEventForm"

async function getEvent(id: string) {
  await dbConnect()

  const event = await Event.findById(id).lean()

  if (!event) return null

  return JSON.parse(JSON.stringify(event))
}

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const event = await getEvent(id)

  if (!event) {
    notFound()
  }

  return <EditEventForm event={event} />
}
