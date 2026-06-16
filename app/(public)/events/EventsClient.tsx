'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Clock, Ticket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

export default function EventsClient() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        
        const { data } = await axios.get(`${apiUrl}/api/events`);
        
        const sorted = [...data].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        setEvents(sorted);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setError("Failed to load events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold">Loading Events...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center max-w-md px-6">
          <p className="text-red-500 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <main className="pb-20">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Events</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Experience Congregation Room 22 live. Get your tickets for our upcoming events and join us on the dancefloor.
          </p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">No upcoming events at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {events.map((event) => {
              const eventDate = new Date(event.date);
              
              return (
                <Card key={event._id || event.id} className="group overflow-hidden bg-card border-border">
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
                            {event.ticketsAvailable || "Tickets Open"}
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
                            <p className="text-3xl font-bold text-primary">
                              ${event.ticketPrice || event.ticketTiers?.[0]?.price || "0"}
                            </p>
                            <p className="text-sm text-muted-foreground">per ticket</p>
                          </div>
                        </div>
                       
                        <p className="text-muted-foreground mb-6">{event.description}</p>
                       
                        <div className="grid sm:grid-cols-2 gap-4 mb-6">
                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-primary mt-0.5" />
                            <div>
                              <p className="font-medium">{event.venue?.name || event.venue}</p>
                              <p className="text-sm text-muted-foreground">
                                {event.venue?.address || event.address}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-primary mt-0.5" />
                            <div>
                              <p className="font-medium">Doors Open</p>
                              <p className="text-sm text-muted-foreground">
                                {event.time || (event.doors && new Date(event.doors).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) || "TBA"}
                              </p>
                            </div>
                          </div>
                        </div>
                       
                        {event.lineup && event.lineup.length > 0 && (
                          <div className="mb-6">
                            <p className="text-sm text-muted-foreground mb-2">Featuring:</p>
                            <div className="flex flex-wrap gap-2">
                              {event.lineup.map((item: any, index: number) => (
                                <Badge key={index} variant="secondary">
                                  {item.dj?.name || "DJ"}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                       
                        <div className="mt-auto flex flex-wrap gap-3">
                          <Link href={`/events/${event.slug || event._id}`}>
                            <Button className="bg-primary hover:bg-primary/90">
                              <Ticket className="w-4 h-4 mr-2" />
                              Get Tickets
                            </Button>
                          </Link>
                          <Link href={`/events/${event.slug || event._id}`}>
                            <Button variant="outline">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
