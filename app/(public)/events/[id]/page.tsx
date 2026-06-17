'use client';

import { useState, useEffect } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, MapPin, Clock, Ticket, Minus, Plus, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LivePlayer } from "@/components/live-player";
import TicketPurchase from "@/components/ticket-purchase";
import axios from "axios";

export default function EventDetailPage() {
  const params = useParams();
  const eventIdOrSlug = params.id as string;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ticketCount, setTicketCount] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        
        // Try both slug and id
        const { data } = await axios.get(`${apiUrl}/api/event/${eventIdOrSlug}`);
        
        setEvent(data);
      } catch (error: any) {
        console.error("Failed to fetch event:", error);
        // Fallback: try fetching all events and find by id
        try {
          const { data: allEvents } = await axios.get(`${apiUrl}/api/events`);
          const found = allEvents.find((e: any) => 
            e._id === eventIdOrSlug || e.slug === eventIdOrSlug || e.id === eventIdOrSlug
          );
          if (found) setEvent(found);
        } catch {}
      } finally {
        setLoading(false);
      }
    };

    if (eventIdOrSlug) fetchEvent();
  }, [eventIdOrSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold">Loading Event...</h2>
        </div>
      </div>
    );
  }

  if (!event) {
    notFound();
  }

  const eventDate = new Date(event.date);
  const venue = event.venue || {};
  const ticketPrice = event.ticketPrice || event.ticketTiers?.[0]?.price || 0;

  const handlePurchase = () => {
    setIsProcessing(true);
    setTimeout(() => {
      alert(`Purchase simulated! ${ticketCount} ticket(s) for ${event.title}`);
      setIsProcessing(false);
    }, 1500);
  };

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
            priority
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
                        <p className="text-muted-foreground">{venue.name || event.venue}</p>
                        <p className="text-sm text-muted-foreground">
                          {venue.address || event.address}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Time</p>
                        <p className="text-muted-foreground">
                          Doors open at {event.time || (event.doors && new Date(event.doors).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })) || "TBA"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Capacity</p>
                        <p className="text-muted-foreground">
                          {event.ticketsAvailable || "Limited"} tickets remaining
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lineup */}
              {event.lineup && event.lineup.length > 0 && (
                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">Lineup</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {event.lineup.map((item: any, index: number) => (
                        <Link key={index} href={`/djs/${item.dj?.slug || '#'}`}>
                          <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                            {item.dj?.image && (
                              <div className="relative w-14 h-14 rounded-full overflow-hidden">
                                <Image src={item.dj.image} alt={item.dj.name} fill className="object-cover" />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold">{item.dj?.name || "DJ"}</p>
                              <p className="text-sm text-muted-foreground">{item.dj?.genre}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Ticket Purchase Sidebar */}
           {/* Ticket Purchase Sidebar */}
<div className="lg:col-span-1">
  <div className="sticky top-24">
    <TicketPurchase 
      event={event} 
      ticketPrice={ticketPrice}
      tier={event.ticketTiers[0]}
    />

    <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
      <Badge variant="secondary" className="mb-2 bg-accent/20 text-accent-foreground">
        Limited Availability
      </Badge>
      <p className="text-sm text-muted-foreground">
        Only {event.ticketsAvailable || "Limited"} tickets remaining. Get yours before they sell out!
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
  );
}
