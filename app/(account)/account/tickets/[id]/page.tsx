import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { auth } from "@/lib/auth"
import { ArrowLeft, Calendar, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QRCodeDisplay } from "@/components/tickets/QRCodeDisplay"
import dbConnect from "@/lib/db"
import { Ticket } from "@/models"

interface TicketDetailPageProps {
  params: Promise<{ id: string }>
}

async function getTicket(ticketId: string, userId: string) {
  await dbConnect()
  const ticket = await Ticket.findOne({ _id: ticketId, userId }).lean()
  if (!ticket) return null
  return JSON.parse(JSON.stringify(ticket))
}

export default async function TicketDetailPage({
  params,
}: TicketDetailPageProps) {
  const { id } = await params
  const session = await auth()
  const ticket = await getTicket(id, session!.user.id)

  if (!ticket) {
    notFound()
  }

  const isUpcoming = new Date(ticket.eventDate) >= new Date()
  const isValid = ticket.status === "valid"

  return (
    <div className="space-y-8">
      <Link
        href="/account/tickets"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tickets
      </Link>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center lg:flex-row lg:items-start lg:gap-8">
            {/* QR Code */}
            <div className="flex flex-col items-center">
              <div className="rounded-lg bg-white p-4">
                <QRCodeDisplay value={ticket.ticketCode} size={200} />
              </div>
              <p className="mt-4 font-mono text-lg font-semibold">
                {ticket.ticketCode}
              </p>
              {!isValid && (
                <Badge variant="destructive" className="mt-2">
                  {ticket.status.toUpperCase()}
                </Badge>
              )}
              {isValid && !isUpcoming && (
                <Badge variant="secondary" className="mt-2">
                  EVENT PASSED
                </Badge>
              )}
            </div>

            {/* Ticket Details */}
            <div className="mt-6 flex-1 text-center lg:mt-0 lg:text-left">
              <Badge>{ticket.tierName}</Badge>
              <h1 className="mt-2 text-2xl font-bold">{ticket.eventTitle}</h1>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-center gap-2 text-muted-foreground lg:justify-start">
                  <Calendar className="h-5 w-5" />
                  <span>
                    {format(
                      new Date(ticket.eventDate),
                      "EEEE, MMMM d, yyyy 'at' h:mm a"
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 text-muted-foreground lg:justify-start">
                  <MapPin className="h-5 w-5" />
                  <span>{ticket.venue}</span>
                </div>
              </div>

              {ticket.scannedAt && (
                <div className="mt-6 rounded-lg bg-secondary p-4">
                  <p className="text-sm text-muted-foreground">
                    Scanned on{" "}
                    {format(new Date(ticket.scannedAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              )}

              <div className="mt-8 rounded-lg border border-dashed border-border p-4">
                <p className="text-sm text-muted-foreground">
                  Show this QR code at the venue entrance for scanning. Make sure
                  your screen brightness is at maximum for best results.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
