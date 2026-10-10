'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import MixcloudPlayer from "@/components/MixcloudPlayer";
import {
  Play,
  Filter,
  Clock,
  Headphones,
} from "lucide-react";

import {
  ArrowLeft,
  Calendar,
  Download,
  Instagram,
  Music2,
  Twitter,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { LivePlayer } from '@/components/live-player';

export default function DJProfilePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState<"date" | "plays">("date");
  const [currentPage, setCurrentPage] = useState(1);

  const [dj, setDj] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGenre, sortBy]);

  useEffect(() => {
    if (!slug) return;

    const fetchDJ = async () => {
      try {
        setLoading(true);
        setNotFoundError(false);

        const { data } = await axios.get(`/api/djs/${slug}`);

        setDj(data);
      } catch (error: any) {
        console.error('Error fetching DJ:', error);

        if (error?.response?.status === 404) {
          setNotFoundError(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDJ();
  }, [slug]);

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0m';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6" />
          <h2 className="text-2xl font-semibold mb-2">
            Loading DJ Profile...
          </h2>
          <p className="text-muted-foreground">
            Please wait while we fetch the data
          </p>
        </div>
      </div>
    );
  }

  if (notFoundError || !dj) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="text-8xl mb-6">😔</div>

          <h1 className="text-4xl font-bold mb-4">
            DJ Not Found
          </h1>

          <p className="text-muted-foreground mb-8 text-lg">
            The DJ you are looking for doesn't exist or may have been removed.
          </p>

          <Link href="/djs">
            <Button size="lg">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to DJs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const mixes = dj.mixes || [];
  const events = dj.events || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pb-24">
        {/* Hero */}
        <section className="relative">
          <div className="absolute inset-0 h-80 bg-gradient-to-b from-primary/20 to-background" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <Link href="/djs">
              <Button
                variant="ghost"
                size="sm"
                className="mb-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to DJs
              </Button>
            </Link>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden shrink-0 ring-4 ring-primary/20">
                <Image
                  src={dj.image || '/placeholder-dj.jpg'}
                  alt={dj.name}
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              <div className="flex-1">
                <Badge
                  variant="secondary"
                  className="mb-3"
                >
                  {dj.genre}
                </Badge>

                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {dj.name}
                </h1>

                <p className="text-lg text-muted-foreground max-w-3xl mb-6">
                  {dj.bio}
                </p>

                <div className="flex flex-wrap gap-3">
                  {dj.socialLinks?.instagram && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={`https://instagram.com/${dj.socialLinks.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Instagram className="w-4 h-4 mr-2" />
                        Instagram
                      </a>
                    </Button>
                  )}

                  {dj.socialLinks?.soundcloud && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={`https://soundcloud.com/${dj.socialLinks.soundcloud}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Music2 className="w-4 h-4 mr-2" />
                        SoundCloud
                      </a>
                    </Button>
                  )}

                  {dj.socialLinks?.twitter && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={`https://twitter.com/${dj.socialLinks.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Twitter className="w-4 h-4 mr-2" />
                        Twitter
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Events */}
        {events.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-3xl font-bold mb-6">
              Upcoming Events
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {events.map((event: any) => {
                const eventDate = new Date(event.date);

                return (
                  <Link
                    key={event._id}
                    href={`/events/${event.slug}`}
                  >
                    <Card className="overflow-hidden group hover:bg-secondary/30 transition-colors h-full">
                      <CardContent className="p-0">
                        <div className="relative aspect-[2/1]">
                          <Image
                            src={
                              event.image ||
                              '/placeholder-event.jpg'
                            }
                            alt={event.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <div className="flex items-center gap-2 text-sm mb-2">
                              <Calendar className="w-4 h-4" />
                              {eventDate.toLocaleDateString()}
                            </div>

                            <h3 className="text-xl font-bold">
                              {event.title}
                            </h3>

                            <p className="text-sm opacity-90">
                              {event.venue?.name}
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

        {/* Mixes */}
        {mixes.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-3xl font-bold mb-6">
              Mixes by {dj.name}
            </h2>

            <div className="grid gap-4">
              {mixes.map((mix: any) => (
               <Card
               key={mix._id}
               className="group overflow-hidden bg-card hover:bg-secondary/30 transition-colors border-border"
             >
               {mix.type === "audio" && (
                 <CardContent className="p-0">
                   <div className="flex flex-col sm:flex-row">
                     <div className="relative w-full sm:w-48 h-48 sm:h-auto sm:min-h-48 shrink-0">
                       {mix.coverImage && (
                         <Image
                           src={mix.coverImage}
                           alt={mix.title}
                           fill
                           sizes="(max-width: 640px) 100vw, 192px"
                           className="object-cover"
                         />
                       )}

                       <button
                         type="button"
                         aria-label={`Preview ${mix.title}`}
                         className="absolute inset-0 flex items-center justify-center bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                         <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                           <Play className="w-6 h-6 text-primary-foreground ml-1" />
                         </div>
                       </button>
                     </div>

                     <div className="flex-1 p-5 sm:p-6 flex flex-col">
                       <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                         <div>
                           <h2 className="text-xl font-bold mb-1">
                             {mix.title}
                           </h2>

                           {mix.djName && (
                             <Link
                               href={`/djs/${mix.djSlug || "#"}`}
                               className="text-primary hover:underline font-medium"
                             >
                               {mix.djName}
                             </Link>
                           )}
                         </div>

                         <Badge variant="secondary">{mix.genre}</Badge>
                       </div>

                       <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                         {mix.releaseDate &&
                           !Number.isNaN(mix.releaseDate.getTime()) && (
                             <div className="flex items-center gap-1.5">
                               <Calendar className="w-4 h-4" />
                               {mix.releaseDate.toLocaleDateString("en-GB", {
                                 month: "short",
                                 day: "numeric",
                                 year: "numeric",
                               })}
                             </div>
                           )}

                         <div className="flex items-center gap-1.5">
                           <Clock className="w-4 h-4" />
                           {mix.duration}
                         </div>

                         <div className="flex items-center gap-1.5">
                           <Headphones className="w-4 h-4" />
                           {(mix.plays || 0).toLocaleString()} plays
                         </div>
                       </div>

                       <div className="mt-auto flex flex-wrap items-center gap-3">
                         {mix.audioUrl && (
                           <a
                             href={mix.audioUrl}
                             download
                             target="_blank"
                             rel="noopener noreferrer"
                           >
                             <Button className="bg-primary hover:bg-primary/90">
                               <Download className="w-4 h-4 mr-2" />
                               Download MP3
                             </Button>
                           </a>
                         )}

                         <Button variant="outline">
                           <Play className="w-4 h-4 mr-2" />
                           Preview
                         </Button>
                       </div>
                     </div>
                   </div>
                 </CardContent>
               )}

               {mix.type === "mixcloud" && (
                 <CardContent className="p-0">
                   <MixcloudPlayer
                     apiUrl={mix.audioUrl}
                     height={180}
                     color="2563eb"
                   />
                 </CardContent>
               )}
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
