import Link from "next/link"
import { format } from "date-fns"
import { Plus, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import dbConnect from "@/lib/db"
import Event from "@/models/Event"

async function getEvents() {
  await dbConnect()
  const events = await Event.find()
    .sort({ date: -1 })
    .populate("organizerId", "name")
    .lean()
  return JSON.parse(JSON.stringify(events))
}

export default async function AdminEventsPage() {
  const events = await getEvents()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-success/10 text-success"
      case "draft":
        return "bg-yellow-500/10 text-yellow-500"
      case "cancelled":
        return "bg-destructive/10 text-destructive"
      case "completed":
        return "bg-secondary text-secondary-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="mt-2 text-muted-foreground">
            Manage all events on the platform
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/events/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Link>
        </Button>
      </div>

      {events.length > 0 ? (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Tickets</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event: {
                _id: string
                title: string
                slug: string
                date: string
                venue: { name: string; city: string }
                status: string
                ticketTiers: { quantity: number; sold: number }[]
                organizerId?: { name: string }
              }) => {
                const totalTickets = event.ticketTiers.reduce(
                  (sum, t) => sum + t.quantity,
                  0
                )
                const soldTickets = event.ticketTiers.reduce(
                  (sum, t) => sum + t.sold,
                  0
                )

                return (
                  <TableRow key={event._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          by {event.organizerId?.name || "Unknown"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(event.date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {event.venue.name}, {event.venue.city}
                    </TableCell>
                    <TableCell>
                      {soldTickets} / {totalTickets}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/events/${event._id}`}>Edit</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <Calendar className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No events yet</h2>
          <p className="mt-2 text-muted-foreground">
            Create your first event to get started
          </p>
          <Button asChild className="mt-4">
            <Link href="/admin/events/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
