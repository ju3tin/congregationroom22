'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";

import {
  ArrowRight,
  Calendar,
  Download,
  Radio,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LivePlayer } from "@/components/live-player";

export default function HomePage() {
  const [loading, setLoading] = useState(true);

  const [featuredDjs, setFeaturedDjs] = useState<any[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);
  const [featuredMixes, setFeaturedMixes] = useState<any[]>([]);

  useEffect(() => {
    const fetchHomepage = async () => {
      try {
        setLoading(true);

        const { data } = await axios.get("/api/homepage");

        setFeaturedDjs(data.featuredDJs || []);
        setFeaturedEvents(data.featuredEvents || []);
        setFeaturedMixes(data.featuredMixes || []);
      } catch (err) {
        console.error("Homepage API error:", err);

        setFeaturedDjs([]);
        setFeaturedEvents([]);
        setFeaturedMixes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHomepage();
  }, []);

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin w-14 h-14 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading homepage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pb-20">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />

          <div className="relative max-w-7xl mx-auto px-4 py-24">
            <h1 className="text-5xl font-bold mb-6">
              Underground Electronic Music{" "}
              <span className="text-primary">24/7</span>
            </h1>

            <p className="text-muted-foreground text-lg mb-8 max-w-2xl">
              Discover DJs, mixes, and live events.
            </p>

            <Button size="lg">
              <Radio className="w-5 h-5 mr-2" />
              Listen Live
            </Button>
          </div>
        </section>

        {/* FEATURED DJS */}
        <section className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold mb-6">Featured DJs</h2>

          {featuredDjs.length === 0 ? (
            <p className="text-muted-foreground">No featured DJs</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredDjs.map((dj: any) => (
                <Link key={dj._id} href={`/djs/${dj.slug}`}>
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative aspect-square">
                        <Image
                          src={dj.image}
                          alt={dj.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold">{dj.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {dj.genre}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* FEATURED MIXES */}
        <section className="bg-card/50 border-y border-border">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <h2 className="text-3xl font-bold mb-6">Featured Mixes</h2>

            {featuredMixes.length === 0 ? (
              <p className="text-muted-foreground">No featured mixes</p>
            ) : (
              <div className="grid gap-4">
                {featuredMixes.map((mix: any) => (
                  <Card key={mix._id}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="relative w-16 h-16">
                        <Image
                          src={mix.coverImage}
                          alt={mix.title}
                          fill
                          className="object-cover rounded"
                        />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold">{mix.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {mix.genre}
                        </p>
                      </div>

                      <Button variant="outline" size="icon">
                        <Download className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* FEATURED EVENTS */}
        <section className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold mb-6">Featured Events</h2>

          {featuredEvents.length === 0 ? (
            <p className="text-muted-foreground">No featured events</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {featuredEvents.map((event: any) => (
                <Link key={event._id} href={`/events/${event.slug}`}>
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative aspect-[2/1]">
                        <Image
                          src={event.image}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />

                        <div className="absolute bottom-0 p-4 text-white">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4" />
                            {new Date(event.date).toLocaleDateString()}
                          </div>

                          <h3 className="text-xl font-bold">
                            {event.title}
                          </h3>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
      <LivePlayer />
    </div>
  );
}
