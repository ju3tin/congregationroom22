import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, Clock, Ticket } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { LivePlayer } from "@/components/live-player"
import { events, djs } from "@/data/radio-data"

export const metadata = {
  title: "Events - Pulse Radio",
  description: "Upcoming Pulse Radio events. Get your tickets and join us on the dancefloor.",
}

export default function EventsPage() {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pb-20">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Events</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Experience Pulse Radio live. Get your tickets for our upcoming events and join us on the dancefloor.
            </p>
          </div>

          <div className="grid gap-8">
            {sortedEvents.map((event) => {
              const eventDate = new Date(event.date)
              const eventDjs = event.djIds
                .map((id) => djs.find((dj) => dj.id === id))
                .filter(Boolean)

              return (
                <Card key={event.id} className="group overflow-hidden bg-card border-border">
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row">
                      <div className="relative w-full lg:w-96 h-64 lg:h-auto shrink-0">
                        <Image
                          src={event.image}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-primary text-primary-foreground">
                            {event.ticketsAvailable} tickets left
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex-1 p-6 lg:p-8 flex flex-col">
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-2 text-primary text-sm font-medium mb-2">
                              <Calendar className="w-4 h-4" />
                              {eventDate.toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                            <h2 className="text-2xl lg:text-3xl font-bold mb-2">{event.title}</h2>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-primary">${event.ticketPrice}</p>
                            <p className="text-sm text-muted-foreground">per ticket</p>
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground mb-6">{event.description}</p>
                        
                        <div className="grid sm:grid-cols-2 gap-4 mb-6">
                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-primary mt-0.5" />
                            <div>
                              <p className="font-medium">{event.venue}</p>
                              <p className="text-sm text-muted-foreground">{event.address}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-primary mt-0.5" />
                            <div>
                              <p className="font-medium">Doors Open</p>
                              <p className="text-sm text-muted-foreground">{event.time}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <p className="text-sm text-muted-foreground mb-2">Featuring:</p>
                          <div className="flex flex-wrap gap-2">
                            {eventDjs.map((dj) => (
                              <Link key={dj!.id} href={`/djs/${dj!.slug}`}>
                                <Badge variant="secondary" className="hover:bg-secondary/80">
                                  {dj!.name}
                                </Badge>
                              </Link>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mt-auto flex flex-wrap gap-3">
                          <Link href={`/events/${event.id}`}>
                            <Button className="bg-primary hover:bg-primary/90">
                              <Ticket className="w-4 h-4 mr-2" />
                              Get Tickets
                            </Button>
                          </Link>
                          <Link href={`/events/${event.id}`}>
                            <Button variant="outline">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      </main>

      <Footer />
      <LivePlayer />
    </div>
  )
}
