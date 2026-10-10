"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import MixcloudPlayer from "@/components/MixcloudPlayer";
import {
  Download,
  Play,
  Filter,
  Calendar,
  Clock,
  Headphones,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LivePlayer } from "@/components/live-player";
import axios from "axios";

const genres = [
  "All",
  "House",
  "Techno",
  "Drum & Bass",
  "Melodic House",
  "Disco",
  "Dubstep",
];

const MIXES_PER_PAGE = 12;

export default function MixesPage() {
  const [mixes, setMixes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState<"date" | "plays">("date");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchMixes = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

        const { data } = await axios.get(`${apiUrl}/api/mixes`);

        setMixes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch mixes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMixes();
  }, []);

  // Reset to page 1 when the genre or sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGenre, sortBy]);

  // Filter and sort mixes
  const filteredMixes = mixes
    .filter((mix) => {
      if (selectedGenre === "All") return true;
      return mix.genre === selectedGenre;
    })
    .sort((a, b) => {
      if (sortBy === "plays") {
        return (b.plays || 0) - (a.plays || 0);
      }

      return (
        new Date(b.releaseDate).getTime() -
        new Date(a.releaseDate).getTime()
      );
    });

  // Pagination calculations
  const totalPages = Math.ceil(filteredMixes.length / MIXES_PER_PAGE);

  const safeCurrentPage = Math.min(
    Math.max(currentPage, 1),
    Math.max(totalPages, 1)
  );

  const paginatedMixes = filteredMixes.slice(
    (safeCurrentPage - 1) * MIXES_PER_PAGE,
    safeCurrentPage * MIXES_PER_PAGE
  );

  const startMix =
    filteredMixes.length === 0
      ? 0
      : (safeCurrentPage - 1) * MIXES_PER_PAGE + 1;

  const endMix = Math.min(
    safeCurrentPage * MIXES_PER_PAGE,
    filteredMixes.length
  );

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6" />
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
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              DJ Mixes
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl">
              Download exclusive mixes from our resident DJs. High-quality
              audio, ready to take anywhere.
            </p>
          </div>

          {/* Filters and sorting */}
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
                    variant={
                      selectedGenre === genre ? "default" : "outline"
                    }
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

          {/* Results count */}
          <div className="mb-5 text-sm text-muted-foreground">
            {filteredMixes.length === 0
              ? "No mixes found"
              : `Showing ${startMix}–${endMix} of ${filteredMixes.length} mixes`}
          </div>

          {/* Mixes grid */}
          <div className="grid gap-4">
            {paginatedMixes.map((mix) => {
              const releaseDate = mix.releaseDate
                ? new Date(mix.releaseDate)
                : null;

              return (
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
                            {releaseDate &&
                              !Number.isNaN(releaseDate.getTime()) && (
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-4 h-4" />
                                  {releaseDate.toLocaleDateString("en-GB", {
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
              );
            })}
          </div>

          {/* Empty state */}
          {filteredMixes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No mixes found in this genre.
              </p>
            </div>
          )}

          {/* Pagination controls */}
          {totalPages > 1 && (
            <nav
              aria-label="Mixes pagination"
              className="mt-10 flex flex-col items-center gap-4"
            >
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safeCurrentPage === 1}
                  onClick={() => goToPage(safeCurrentPage - 1)}
                >
                  Previous
                </Button>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={
                        safeCurrentPage === page ? "default" : "outline"
                      }
                      size="sm"
                      aria-current={
                        safeCurrentPage === page ? "page" : undefined
                      }
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </Button>
                  )
                )}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={safeCurrentPage === totalPages}
                  onClick={() => goToPage(safeCurrentPage + 1)}
                >
                  Next
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                Page {safeCurrentPage} of {totalPages}
              </p>
            </nav>
          )}
        </section>
      </main>

      <Footer />
      <LivePlayer />
    </div>
  );
}
