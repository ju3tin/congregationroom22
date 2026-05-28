"use client"

import { notFound, useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { ArrowLeft, Calendar, MapPin, Clock, Ticket, Minus, Plus, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { LivePlayer } from "@/components/live-player"
import { events, djs } from "@/data/radio-data"

export default function EventDetailPage() {
  const params = useParams()
  const event = events.find((e) => e.id === params.id)
  const [ticketCount, setTicketCount] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)

  if (!event) {
    notFound()
  }

  const eventDate = new Date(event.date)
  const eventDjs = event.djIds
    .map((id) => djs.find((dj) => dj.id === id))
    .filter(Boolean)

  const handlePurchase = () => {
    setIsProcessing(true)
    setTimeout(() => {
      alert(`Purchase simulated! ${ticketCount} ticket(s) for ${event.title}`)
      setIsProcessing(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pb-20">
        {/* Hero */}
        <div className="relative h-64 sm:h-80 lg:h-96">
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <Link href="/events">
              <Button variant="ghost" size="sm" className="mb-4 bg-background/50 backdrop-blur-sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-primary text-sm font-medium mb-2">
              <Calendar className="w-4 h-4" />
              {eventDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">{event.title}</h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Event Details */}
            <div className="lg:col-span-2">
              <Card className="bg-card border-border mb-8">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">About This Event</h2>
                  <p className="text-muted-foreground leading-relaxed">{event.description}</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border mb-8">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Event Details</h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Venue</p>
                        <p className="text-muted-foreground">{event.venue}</p>
                        <p className="text-sm text-muted-foreground">{event.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Time</p>
                        <p className="text-muted-foreground">Doors open at {event.time}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Capacity</p>
                        <p className="text-muted-foreground">{event.ticketsAvailable} tickets remaining</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Lineup</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {eventDjs.map((dj) => (
                      <Link key={dj!.id} href={`/djs/${dj!.slug}`}>
                        <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                          <div className="relative w-14 h-14 rounded-full overflow-hidden">
                            <Image
                              src={dj!.image}
                              alt={dj!.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold">{dj!.name}</p>
                            <p className="text-sm text-muted-foreground">{dj!.genre}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ticket Purchase */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-2">Get Tickets</h2>
                    <p className="text-muted-foreground text-sm mb-6">
                      Secure your spot at this event
                    </p>
                    
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-medium">Ticket Price</span>
                      <span className="text-2xl font-bold text-primary">${event.ticketPrice}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-6 p-4 bg-secondary rounded-lg">
                      <span className="font-medium">Quantity</span>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                          disabled={ticketCount <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{ticketCount}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setTicketCount(Math.min(10, ticketCount + 1))}
                          disabled={ticketCount >= 10}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="border-t border-border pt-4 mb-6">
                      <div className="flex items-center justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary">${event.ticketPrice * ticketCount}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Including all fees and taxes
                      </p>
                    </div>
                    
                    <Button
                      className="w-full bg-primary hover:bg-primary/90"
                      size="lg"
                      onClick={handlePurchase}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        "Processing..."
                      ) : (
                        <>
                          <Ticket className="w-4 h-4 mr-2" />
                          Purchase Tickets
                        </>
                      )}
                    </Button>
                    
                    <p className="text-xs text-muted-foreground text-center mt-4">
                      By purchasing, you agree to our Terms & Conditions
                    </p>
                  </CardContent>
                </Card>
                
                <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <Badge variant="secondary" className="mb-2 bg-accent/20 text-accent-foreground">
                    Limited Availability
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Only {event.ticketsAvailable} tickets remaining. Get yours before they sell out!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <LivePlayer />
    </div>
  )
}
