import Link from "next/link"
import { format } from "date-fns"
import { auth } from "@/lib/auth"
import { Calendar, MapPin, Ticket as TicketIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import dbConnect from "@/lib/db"
import { Ticket } from "@/models"

async function getUserTickets(userId: string) {
  await dbConnect()
  const tickets = await Ticket.find({ userId })
    .sort({ eventDate: 1 })
    .lean()
  return JSON.parse(JSON.stringify(tickets))
}

export default async function TicketsPage() {
  const session = await auth()
  const tickets = await getUserTickets(session!.user.id)

  const upcomingTickets = tickets.filter(
    (t: { eventDate: string; status: string }) =>
      new Date(t.eventDate) >= new Date() && t.status === "valid"
  )
  const pastTickets = tickets.filter(
    (t: { eventDate: string; status: string }) =>
      new Date(t.eventDate) < new Date() || t.status !== "valid"
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Tickets</h1>
        <p className="mt-2 text-muted-foreground">
          View and manage your event tickets
        </p>
      </div>

      {/* Upcoming Tickets */}
      <div>
        <h2 className="text-xl font-semibold">Upcoming Events</h2>
        {upcomingTickets.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {upcomingTickets.map((ticket: {
              _id: string
              ticketCode: string
              eventTitle: string
              tierName: string
              eventDate: string
              venue: string
              status: string
            }) => (
              <Card key={ticket._id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{ticket.eventTitle}</h3>
                      <p className="text-sm text-accent">{ticket.tierName}</p>
                    </div>
                    <Badge
                      variant={ticket.status === "valid" ? "default" : "secondary"}
                    >
                      {ticket.status}
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(ticket.eventDate), "EEE, MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{ticket.venue}</span>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground">Ticket Code</p>
                    <p className="font-mono text-sm">{ticket.ticketCode}</p>
                  </div>

                  <Button asChild className="mt-4 w-full" variant="outline">
                    <Link href={`/account/tickets/${ticket._id}`}>
                      View Ticket
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="mt-4">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <TicketIcon className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">No upcoming tickets</p>
              <Button asChild className="mt-4">
                <Link href="/events">Browse Events</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Past Tickets */}
      {pastTickets.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold">Past Events</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {pastTickets.map((ticket: {
              _id: string
              ticketCode: string
              eventTitle: string
              tierName: string
              eventDate: string
              venue: string
              status: string
            }) => (
              <Card key={ticket._id} className="opacity-60">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{ticket.eventTitle}</h3>
                      <p className="text-sm text-muted-foreground">
                        {ticket.tierName}
                      </p>
                    </div>
                    <Badge variant="secondary">{ticket.status}</Badge>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(ticket.eventDate), "MMM d, yyyy")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
