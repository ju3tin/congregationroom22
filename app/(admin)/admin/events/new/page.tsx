import dbConnect from "@/lib/db"
import DJ from "@/models/DJ"
import EventForm from "./event-form"

export default async function NewEventPage() {
  await dbConnect()

  const djs = await DJ.find({})
    .select("_id name")
    .sort({ name: 1 })
    .lean()

  const serializedDjs = djs.map((dj) => ({
    _id: dj._id.toString(),
    name: dj.name,
  }))

  return (
    <div className="container mx-auto py-8">
      <EventForm djs={serializedDjs} />
    </div>
  )
}
