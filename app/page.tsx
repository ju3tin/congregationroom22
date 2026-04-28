import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Calendar, Download, Radio, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { LivePlayer } from "@/components/live-player"
import { djs, events, mixes } from "@/data/radio-data"

export default function HomePage() {
  const featuredDjs = djs.slice(0, 4)
  const upcomingEvents = events.slice(0, 2)
  const latestMixes = mixes.slice(0, 3)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pb-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(var(--primary)/0.15),transparent_50%)]" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-6">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                </span>
                <span className="text-sm font-medium text-accent uppercase tracking-wider">
                  Now Broadcasting
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6 text-balance">
                Underground Electronic Music,{" "}
                <span className="text-primary">24/7</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl">
                Your home for the best house, techno, drum & bass, and more. Tune in to discover new sounds and connect with our global community of music lovers.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Radio className="w-5 h-5 mr-2" />
                  Listen Live
                </Button>
                <Link href="/schedule">                
                  <Button size="lg" variant="outline">
                  <Calendar className="w-5 h-5 mr-2" />
                  View Schedule
                </Button>
                  </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured DJs */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">Featured DJs</h2>
              <p className="text-muted-foreground mt-1">Meet the artists behind the decks</p>
            </div>
            <Link href="/djs">
              <Button variant="ghost" className="hidden sm:flex">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredDjs.map((dj) => (
              <Link key={dj.id} href={`/djs/${dj.slug}`}>
                <Card className="group overflow-hidden bg-card hover:bg-secondary/50 transition-colors border-border">
                  <CardContent className="p-0">
                    <div className="relative aspect-square">
                      <Image
                        src={dj.image}
                        alt={dj.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-semibold text-foreground">{dj.name}</h3>
                        <p className="text-sm text-muted-foreground">{dj.genre}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <Link href="/djs" className="sm:hidden">
            <Button variant="outline" className="w-full mt-4">
              View All DJs <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </section>

        {/* Latest Mixes */}
        <section className="bg-card/50 border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">Latest Mixes</h2>
                <p className="text-muted-foreground mt-1">Download and take the music with you</p>
              </div>
              <Link href="/mixes">
                <Button variant="ghost" className="hidden sm:flex">
                  View All <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="grid gap-4">
              {latestMixes.map((mix) => (
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
                        <p className="text-sm text-muted-foreground">{mix.djName}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
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

            <Link href="/mixes" className="sm:hidden">
              <Button variant="outline" className="w-full mt-4">
                View All Mixes <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">Upcoming Events</h2>
              <p className="text-muted-foreground mt-1">Catch us in real life</p>
            </div>
            <Link href="/events">
              <Button variant="ghost" className="hidden sm:flex">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {upcomingEvents.map((event) => {
              const eventDate = new Date(event.date)
              const eventDjs = event.djIds.map((id) => djs.find((dj) => dj.id === id)?.name).filter(Boolean)

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
                            })}{" "}
                            at {event.time}
                          </div>
                          <h3 className="text-xl font-bold mb-1">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">{event.venue}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Featuring: {eventDjs.join(", ")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>

          <Link href="/events" className="sm:hidden">
            <Button variant="outline" className="w-full mt-4">
              View All Events <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </section>

        {/* Listen on DAB CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30 overflow-hidden">
            <CardContent className="p-8 sm:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Headphones className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
                </div>
                <div className="text-center md:text-left flex-1">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">Listen on DAB Digital Radio</h2>
                  <p className="text-muted-foreground max-w-xl">
                    Take Congregation Room 22 with you anywhere. Find us on DAB digital radio across major cities, or stream directly from our app.
                  </p>
                </div>
                <Link href="/listen">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 shrink-0">
                    Find Your Frequency
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
      <LivePlayer />
    </div>
  )
}
