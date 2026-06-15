import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, Download, Instagram, Music2, Twitter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LivePlayer } from "@/components/live-player";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dj = await getDjBySlug(slug);
  if (!dj) return { title: "DJ Not Found" };

  return {
    title: `${dj.name} - Congregation Room 22`,
    description: dj.bio,
  };
}

async function getDjBySlug(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/djs?slug=${slug}`, {
      cache: "no-store",
      next: { revalidate: 0 },
    });

    console.log(`Fetching DJ with slug: ${slug}, Status: ${res.status}`);

    if (!res.ok) {
      console.error("API Error:", res.statusText);
      return null;
    }

    const data = await res.json();
    console.log("DJ API Response:", data);

    return data[0] || null;
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

async function getMixesByDj(djId: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mixes?djId=${djId}`, {
      cache: "no-store",
    });
    return res.ok ? await res.json() : [];
  } catch {
    return [];
  }
}

async function getEventsByDj(djId: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events?djId=${djId}`, {
      cache: "no-store",
    });
    return res.ok ? await res.json() : [];
  } catch {
    return [];
  }
}

export default async function DJProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  console.log("Requested slug:", slug);

  const dj = await getDjBySlug(slug);

  if (!dj) {
    console.error(`DJ not found for slug: ${slug}`);
    notFound();
  }

  const [djMixes, djEvents] = await Promise.all([
    getMixesByDj(dj._id),
    getEventsByDj(dj._id),
  ]);

  // Rest of your JSX remains the same...
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
                <Image src={dj.image} alt={dj.name} fill className="object-cover" priority />
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
                  {/* Add SoundCloud & Twitter similarly */}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Other sections (Shows, Mixes, Events) ... */}
        {/* (Keep the rest of your sections from previous version) */}

      </main>
      <Footer />
      <LivePlayer />
    </div>
  );
}
