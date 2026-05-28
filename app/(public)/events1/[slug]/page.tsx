import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, Calendar, Clock, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { TicketSelector } from "@/components/events/TicketSelector"
import dbConnect from "@/lib/db"
import Event from "@/models/Event"

interface EventPageProps {
  params: Promise<{ slug: string }>
}

async function getEvent(slug: string) {
  await dbConnect()
  const event = await Event.findOne({ slug, status: "published" }).lean()
  if (!event) return null
  return JSON.parse(JSON.stringify(event))
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params
  const event = await getEvent(slug)

  if (!event) {
    notFound()
  }

  const eventDate = new Date(event.date)
  const doorsTime = new Date(event.doors)

  return (
    <div className="min-h-screen">
      {/* Hero Image */}
      <div className="relative h-[40vh] min-h-[300px] w-full lg:h-[50vh]">
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-balance">
              {event.title}
            </h1>

            {/* Event Details */}
            <div className="mt-6 flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-5 w-5" />
                <span>{format(eventDate, "EEEE, MMMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-5 w-5" />
                <span>Doors: {format(doorsTime, "h:mm a")}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5" />
                <span>
                  {event.venue.name}, {event.venue.city}
                </span>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold">About This Event</h2>
              <div className="mt-4 whitespace-pre-wrap text-muted-foreground">
                {event.description}
              </div>
            </div>

            {/* Venue Info */}
            <Separator className="my-8" />
            <div>
              <h2 className="text-xl font-semibold">Venue</h2>
              <div className="mt-4">
                <p className="font-medium">{event.venue.name}</p>
                <p className="text-muted-foreground">{event.venue.address}</p>
                <p className="text-muted-foreground">{event.venue.city}</p>
              </div>
            </div>
          </div>

          {/* Sidebar - Ticket Selection */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-lg border border-border bg-card p-6">
              <TicketSelector
                eventId={event._id}
                eventTitle={event.title}
                eventDate={event.date}
                eventImage={event.image}
                tiers={event.ticketTiers}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
