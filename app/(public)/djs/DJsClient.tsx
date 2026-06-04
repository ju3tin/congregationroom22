"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Music2, Twitter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SocialLinks {
  instagram?: string;
  soundcloud?: string;
  twitter?: string;
}

interface DJ {
  _id: string;
  name: string;
  slug: string;
  genre: string;
  bio: string;
  image: string;
  socialLinks: SocialLinks;
}

export default function DJsClient() {
  const [djs, setDjs] = useState<DJ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchDJs() {
      try {
        const res = await fetch("/api/dj");
        if (!res.ok) throw new Error("Failed to load DJs");

        const data = await res.json();
        setDjs(data.djs || []);
      } catch (err: any) {
        setError(err.message || "Failed to load DJs");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchDJs();
  }, []);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Our DJs</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            The talented artists who bring you the best underground electronic music, 24 hours a day, 7 days a week.
          </p>
        </div>
        <div className="flex items-center justify-center py-20">
          <p className="text-lg">Loading DJs...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <p className="text-red-500 text-center">{error}</p>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Our DJs</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          The talented artists who bring you the best underground electronic music, 24 hours a day, 7 days a week.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {djs.map((dj) => (
          <Card
            key={dj._id}
            className="group overflow-hidden bg-card hover:bg-secondary/30 transition-colors border-border"
          >
            <CardContent className="p-0">
              <Link href={`/djs/${dj.slug}`}>
                <div className="relative aspect-square">
                  <Image
                    src={dj.image}
                    alt={dj.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                </div>
              </Link>

              <div className="p-5">
                <Link href={`/djs/${dj.slug}`}>
                  <h2 className="text-xl font-bold hover:text-primary transition-colors">
                    {dj.name}
                  </h2>
                </Link>
                <p className="text-sm text-primary font-medium mt-1">{dj.genre}</p>
                <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                  {dj.bio}
                </p>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div className="flex gap-2">
                    {dj.socialLinks?.instagram && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a
                          href={`https://instagram.com/${dj.socialLinks.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Instagram"
                        >
                          <Instagram className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                    {dj.socialLinks?.soundcloud && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a
                          href={`https://soundcloud.com/${dj.socialLinks.soundcloud}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="SoundCloud"
                        >
                          <Music2 className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                    {dj.socialLinks?.twitter && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a
                          href={`https://twitter.com/${dj.socialLinks.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Twitter"
                        >
                          <Twitter className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>

                  <Link href={`/djs/${dj.slug}`}>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {djs.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No DJs found.</p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
