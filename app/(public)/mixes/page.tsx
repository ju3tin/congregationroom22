'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Download, Play, Filter, Calendar, Clock, Headphones } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LivePlayer } from "@/components/live-player";
import axios from "axios";

const genres = ["All", "House", "Techno", "Drum & Bass", "Melodic House", "Disco", "Dubstep"];

export default function MixesPage() {
  const [mixes, setMixes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState<"date" | "plays">("date");

  useEffect(() => {
    const fetchMixes = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        const { data } = await axios.get(`${apiUrl}/api/mixes`);
        setMixes(data);
      } catch (error) {
        console.error("Failed to fetch mixes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMixes();
  }, []);

  // Filter & Sort
  const filteredMixes = mixes
    .filter((mix) => {
      if (selectedGenre === "All") return true;
      return mix.genre === selectedGenre;
    })
    .sort((a, b) => {
      if (sortBy === "plays") {
        return (b.plays || 0) - (a.plays || 0);
      }
      return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold">Loading Mixes...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
     
      <main className="pb-20">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">DJ Mixes</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Download exclusive mixes from our resident DJs. High-quality audio, ready to take anywhere.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Genre:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <Button
                    key={genre}
                    variant={selectedGenre === genre ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedGenre(genre)}
                  >
                    {genre}
                  </Button>
                ))}
              </div>
            </div>
           
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <div className="flex gap-2">
                <Button
                  variant={sortBy === "date" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("date")}
                >
                  Latest
                </Button>
                <Button
                  variant={sortBy === "plays" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("plays")}
                >
                  Popular
                </Button>
              </div>
            </div>
          </div>

          {/* Mixes Grid */}
          <div className="grid gap-4">
            {filteredMixes.map((mix) => {
              const releaseDate = new Date(mix.releaseDate);

              return (
                <Card key={mix._id} className="group overflow-hidden bg-card hover:bg-secondary/30 transition-colors border-border">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative w-full sm:w-48 h-48 sm:h-auto shrink-0">
                        <Image
                          src={mix.coverImage}
                          alt={mix.title}
                          fill
                          className="object-cover"
                        />
                        <button className="absolute inset-0 flex items-center justify-center bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                            <Play className="w-6 h-6 text-primary-foreground ml-1" />
                          </div>
                        </button>
                      </div>
                     
                      <div className="flex-1 p-5 sm:p-6 flex flex-col">
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                          <div>
                            <h2 className="text-xl font-bold mb-1">{mix.title}</h2>
                            {mix.djName && (
                              <Link
                                href={`/djs/${mix.djSlug || '#'}`}
                                className="text-primary hover:underline font-medium"
                              >
                                {mix.djName}
                              </Link>
                            )}
                          </div>
                          <Badge variant="secondary">{mix.genre}</Badge>
                        </div>
                       
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {releaseDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {mix.duration}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Headphones className="w-4 h-4" />
                            {(mix.plays || 0).toLocaleString()} plays
                          </div>
                        </div>
                       
                        <div className="mt-auto flex items-center gap-3">
                          {mix.audioUrl && (
                            <a href={mix.audioUrl} download target="_blank">
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
                </Card>
              );
            })}
          </div>

          {filteredMixes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No mixes found in this genre.</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
      <LivePlayer />
    </div>
  );
}
