import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { Calendar, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface EventCardProps {
  event: {
    _id: string
    title: string
    slug: string
    image: string
    date: Date
    venue: {
      name: string
      city: string
    }
    ticketTiers: Array<{
      price: number
      quantity: number
      sold: number
    }>
  }
}

export function EventCard({ event }: EventCardProps) {
  const lowestPrice = Math.min(...event.ticketTiers.map((t) => t.price))
  const totalTickets = event.ticketTiers.reduce((sum, t) => sum + t.quantity, 0)
  const totalSold = event.ticketTiers.reduce((sum, t) => sum + t.sold, 0)
  const soldOut = totalSold >= totalTickets

  return (
    <Link href={`/events/${event.slug}`}>
      <Card className="group overflow-hidden border-border bg-card transition-all hover:border-accent/50">
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {soldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <Badge variant="destructive" className="text-lg">
                Sold Out
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(event.date), "EEE, MMM d, yyyy")}</span>
          </div>
          <h3 className="mt-2 text-xl font-bold tracking-tight text-balance group-hover:text-accent transition-colors">
            {event.title}
          </h3>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {event.venue.name}, {event.venue.city}
            </span>
          </div>
          {!soldOut && (
            <p className="mt-4 text-lg font-semibold">
              From ${lowestPrice.toFixed(2)}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
