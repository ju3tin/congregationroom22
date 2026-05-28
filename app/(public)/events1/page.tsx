import { Calendar, Filter, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { EventCard } from "@/components/events/EventCard"
import dbConnect from "@/lib/db"
import Event from "@/models/Event"

interface EventsPageProps {
  searchParams: Promise<{
    search?: string
    city?: string
  }>
}

async function getEvents(search?: string, city?: string) {
  await dbConnect()
  
  const query: Record<string, unknown> = {
    status: "published",
    date: { $gte: new Date() },
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { "venue.name": { $regex: search, $options: "i" } },
    ]
  }

  if (city) {
    query["venue.city"] = { $regex: city, $options: "i" }
  }

  const events = await Event.find(query).sort({ date: 1 }).lean()
  return JSON.parse(JSON.stringify(events))
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams
  const events = await getEvents(params.search, params.city)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight">Events</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Discover upcoming concerts and music events
          </p>

          {/* Search */}
          <form className="mt-8 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="search"
                placeholder="Search events or venues..."
                defaultValue={params.search}
                className="pl-10"
              />
            </div>
            <div className="relative sm:w-48">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="city"
                placeholder="City"
                defaultValue={params.city}
                className="pl-10"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Events Grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        {events.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event: ReturnType<typeof getEvents> extends Promise<infer T> ? T[number] : never) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24">
            <Calendar className="h-16 w-16 text-muted-foreground" />
            <h2 className="mt-4 text-2xl font-semibold">No events found</h2>
            <p className="mt-2 text-muted-foreground">
              {params.search || params.city
                ? "Try adjusting your search filters"
                : "Check back soon for new events"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
