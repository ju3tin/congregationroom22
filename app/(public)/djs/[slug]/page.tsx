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
import axios from "axios";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dj = await getDjBySlug(slug);
  if (!dj) return { title: "DJ Not Found" };

  return {
    title: `${dj.name} - Congregation Room 22`,
    description: dj.bio || "DJ Profile",
  };
}

async function getDjBySlug(slug: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const url = `${apiUrl}/api/djs?slug=${encodeURIComponent(slug)}`;

    console.log("🔍 Fetching DJ from:", url);

    const { data } = await axios.get(url, {
      headers: {
        "Cache-Control": "no-cache",
      },
    });

    console.log("✅ DJ Data Received:", data?.length ? data[0].name : "No data");
    return data[0] || null;
  } catch (error) {
    console.error("❌ Axios Error in getDjBySlug:", error);
    return null;
  }
}

async function getMixesByDj(djId: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const { data } = await axios.get(`${apiUrl}/api/mixes?djId=${djId}`);
    return data || [];
  } catch (error) {
    console.error("❌ Error fetching mixes:", error);
    return [];
  }
}

async function getEventsByDj(djId: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const { data } = await axios.get(`${apiUrl}/api/events?djId=${djId}`);
    return data || [];
  } catch (error) {
    console.error("❌ Error fetching events:", error);
    return [];
  }
}

export default async function DJProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  console.log("📄 Rendering page for slug:", slug);

  const dj = await getDjBySlug(slug);

  if (!dj) {
    console.error("🚨 DJ not found for slug:", slug);
    notFound();
  }

  const [djMixes, djEvents] = await Promise.all([
    getMixesByDj(dj._id),
    getEventsByDj(dj._id),
  ]);

  return (
    <>
      <Header />
      {/* Hero Section */}
      <div className="relative min-h-[60vh] bg-black">
        <div className="absolute inset-0">
          <Image
            src={dj.image}
            alt={dj.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black" />
        </div>

        <div className="relative z-10 container mx-auto px-6 pt-20 pb-12">
          <Link href="/djs">
            <Button variant="ghost" size="sm" className="mb-6 text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to DJs
            </Button>
          </Link>

          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-3">{dj.genre}</Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">{dj.name}</h1>
            <p className="text-xl text-gray-300 max-w-2xl">{dj.bio}</p>

            <div className="flex flex-wrap gap-3 mt-8">
              {dj.socialLinks?.instagram && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://instagram.com/${dj.socialLinks.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Instagram className="w-4 h-4 mr-2" /> Instagram
                  </a>
                </Button>
              )}

              {dj.socialLinks?.soundcloud && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://soundcloud.com/${dj.socialLinks.soundcloud}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Music2 className="w-4 h-4 mr-2" /> SoundCloud
                  </a>
                </Button>
              )}

              {dj.socialLinks?.twitter && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://twitter.com/${dj.socialLinks.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter className="w-4 h-4 mr-2" /> Twitter
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add your other sections (Upcoming Shows, Mixes, Events) here */}
      {/* ... copy from previous version ... */}

      <LivePlayer />
      <Footer />
    </>
  );
}
