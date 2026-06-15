'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, Download, Instagram, Music2, Twitter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LivePlayer } from "@/components/live-player";
import axios from "axios";

export default function DJProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string>("");
  const [dj, setDj] = useState<any>(null);
  const [djMixes, setDjMixes] = useState<any[]>([]);
  const [djEvents, setDjEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Extract slug from params
  useEffect(() => {
    params.then(p => setSlug(p.slug));
  }, [params]);

  // Fetch DJ data
  useEffect(() => {
    if (!slug) return;

    const fetchDjData = async () => {
      try {
        setLoading(true);
        setNotFound(false);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        const { data } = await axios.get(`${apiUrl}/api/djs/${slug}`);

        setDj(data);
        setDjMixes(data.mixes || []);
        setDjEvents(data.events || []);
      } catch (err: any) {
        console.error("Failed to fetch DJ:", err);
        if (err.response?.status === 404) {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDjData();
  }, [slug]);

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold mb-2">Loading DJ Profile</h2>
          <p className="text-muted-foreground">Please wait...</p>
        </div>
      </div>
    );
  }

  // DJ Not Found
  if (notFound || !dj) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="text-8xl mb-6">😔</div>
          <h1 className="text-4xl font-bold mb-4">DJ Not Found</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Sorry, we couldn&apos;t find a DJ with that name.
          </p>
          <Link href="/djs">
            <Button size="lg">
              <ArrowLeft className="mr-2 w-5 h-5" />
              Back to All DJs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Main DJ Profile
  return (
    <div className="min-h-screen bg-background">
      <Header />
     
      <main className="pb-20">
        {/* Hero Section */}
        <section className="relative">
          <div className="absolute inset-0 h-80 bg-gradient-to-b from-primary/20 to-background" />
         
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <Link href="/djs">
              <Button variant="ghost" size="sm" className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to DJs
              </Button>
            </Link>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-2xl overflow-hidden shrink-0 ring-4 ring-primary/20">
                <Image
                  src={dj.image}
                  alt={dj.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
             
              <div className="flex-1">
                <Badge variant="secondary" className="mb-3">{dj.genre}</Badge>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">{dj.name}</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mb-6">{dj.bio}</p>
               
                <div className="flex flex-wrap gap-3">
                  {dj.socialLinks?.instagram && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`https://instagram.com/${dj.socialLinks.instagram}`} target="_blank" rel="noopener noreferrer">
                        <Instagram className="w-4 h-4 mr-2" /> Instagram
                      </a>
                    </Button>
                  )}
                  {dj.socialLinks?.soundcloud && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`https://soundcloud.com/${dj.socialLinks.soundcloud}`} target="_blank" rel="noopener noreferrer">
                        <Music2 className="w-4 h-4 mr-2" /> SoundCloud
                      </a>
                    </Button>
                  )}
                  {dj.socialLinks?.twitter && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`https://twitter.com/${dj.socialLinks.twitter}`} target="_blank" rel="noopener noreferrer">
                        <Twitter className="w-4 h-4 mr-2" /> Twitter
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Events Section */}
        {djEvents.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {djEvents.map((event: any) => {
                const eventDate = new Date(event.date);
                return (
                  <Link key={event._id} href={`/events/${event.slug || event._id}`}>
                    <Card className="group overflow-hidden bg-card hover:bg-secondary/30 transition-colors border-border h-full">
                      <CardContent className="p-0">
                        <div className="relative aspect-[2/1]">
                          <Image
                            src={event.image}
                            alt={event.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-6">
                            <div className="flex items-center gap-2 text-primary text-sm font-medium mb-2">
                              <Calendar className="w-4 h-4" />
                              {eventDate.toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                            <h3 className="text-xl font-bold">{event.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {event.venue?.name || event.venue}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Mixes Section */}
        {djMixes.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-bold mb-6">Mixes by {dj.name}</h2>
            <div className="grid gap-4">
              {djMixes.map((mix: any) => (
                <Card key={mix._id} className="bg-card hover:bg-secondary/30 transition-colors border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden">
                        <Image src={mix.coverImage} alt={mix.title} fill className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold truncate">{mix.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span>{mix.duration}</span>
                          <span>{mix.genre}</span>
                          <span>{(mix.plays || 0).toLocaleString()} plays</span>
                        </div>
                      </div>
                      {mix.audioUrl && (
                        <a href={mix.audioUrl} target="_blank" download>
                          <Button variant="outline" size="icon">
                            <Download className="w-4 h-4" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
      <LivePlayer />
    </div>
  );
}
