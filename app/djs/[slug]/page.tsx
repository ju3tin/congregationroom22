import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, Download, Instagram, Music2, Twitter } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { LivePlayer } from "@/components/live-player"
import { djs, getMixesByDj, getEventsByDj, getDjBySlug } from "@/data/radio-data"

export async function generateStaticParams() {
  return djs.map((dj) => ({
    slug: dj.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const dj = getDjBySlug(slug)
  if (!dj) return { title: "DJ Not Found" }
  
  return {
    title: `${dj.name} - Congregation Room 22`,
    description: dj.bio,
  }
}

export default async function DJProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const dj = getDjBySlug(slug)
  
  if (!dj) {
    notFound()
  }

  const djMixes = getMixesByDj(dj.id)
  const djEvents = getEventsByDj(dj.id)

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
                />
              </div>
              
              <div className="flex-1">
                <Badge variant="secondary" className="mb-3">
                  {dj.genre}
                </Badge>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                  {dj.name}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mb-6">
                  {dj.bio}
                </p>
                
                <div className="flex flex-wrap gap-3">
                  {dj.socialLinks.instagram && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`https://instagram.com/${dj.socialLinks.instagram}`} target="_blank" rel="noopener noreferrer">
                        <Instagram className="w-4 h-4 mr-2" />
                        Instagram
                      </a>
                    </Button>
                  )}
                  {dj.socialLinks.soundcloud && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`https://soundcloud.com/${dj.socialLinks.soundcloud}`} target="_blank" rel="noopener noreferrer">
                        <Music2 className="w-4 h-4 mr-2" />
                        SoundCloud
                      </a>
                    </Button>
                  )}
                  {dj.socialLinks.twitter && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`https://twitter.com/${dj.socialLinks.twitter}`} target="_blank" rel="noopener noreferrer">
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

        {/* Shows Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold mb-6">Upcoming Shows</h2>
          <div className="grid gap-4">
            {dj.upcomingShows.map((show, index) => (
              <Card key={index} className="bg-card border-border">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{show}</p>
                    <p className="text-sm text-muted-foreground">On Congregation Room 22</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Mixes Section */}
        {djMixes.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-bold mb-6">Mixes by {dj.name}</h2>
            <div className="grid gap-4">
              {djMixes.map((mix) => (
                <Card key={mix.id} className="bg-card hover:bg-secondary/30 transition-colors border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden">
                        <Image
                          src={mix.coverImage}
                          alt={mix.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold truncate">{mix.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span>{mix.duration}</span>
                          <span>{mix.genre}</span>
                          <span>{mix.plays.toLocaleString()} plays</span>
                        </div>
                      </div>
                      <Button variant="outline" size="icon" className="shrink-0">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Events Section */}
        {djEvents.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {djEvents.map((event) => {
                const eventDate = new Date(event.date)
                return (
                  <Link key={event.id} href={`/events/${event.id}`}>
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
                            <p className="text-sm text-muted-foreground">{event.venue}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </main>

      <Footer />
      <LivePlayer />
    </div>
  )
}
