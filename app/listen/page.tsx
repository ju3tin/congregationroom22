import { Radio, Smartphone, Car, Headphones, Wifi, Signal } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { LivePlayer } from "@/components/live-player"
import { dabChannels } from "@/data/radio-data"

export const metadata = {
  title: "Listen - Pulse Radio",
  description: "Find Pulse Radio on DAB digital radio or stream online. Multiple ways to tune in.",
}

export default function ListenPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pb-20">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="max-w-3xl">
              <Badge variant="secondary" className="mb-4">DAB Digital Radio</Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Listen to Pulse Radio
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Tune in anywhere, anytime. Find us on DAB digital radio across major cities, 
                stream online, or use our mobile apps.
              </p>
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <Radio className="w-5 h-5 mr-2" />
                Start Listening Now
              </Button>
            </div>
          </div>
        </section>

        {/* DAB Channels */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">DAB Channels</h2>
          <p className="text-muted-foreground mb-8">
            Find us on your DAB radio. Just search for these channels.
          </p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dabChannels.map((channel) => (
              <Card key={channel.id} className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Radio className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant="outline">{channel.frequency}</Badge>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{channel.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{channel.description}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Signal className="w-4 h-4" />
                    <span>{channel.bitrate}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How to Listen */}
        <section className="bg-card/50 border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Ways to Listen</h2>
            <p className="text-muted-foreground mb-8">
              Multiple ways to tune in to Pulse Radio.
            </p>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-card border-border">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Radio className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">DAB Radio</h3>
                  <p className="text-sm text-muted-foreground">
                    Search for Pulse Radio on your DAB digital radio receiver.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">Mobile App</h3>
                  <p className="text-sm text-muted-foreground">
                    Download our app for iOS or Android for on-the-go listening.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Wifi className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">Web Player</h3>
                  <p className="text-sm text-muted-foreground">
                    Stream directly from our website using the player below.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Car className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">In Your Car</h3>
                  <p className="text-sm text-muted-foreground">
                    Use DAB, Bluetooth, or CarPlay/Android Auto to listen while driving.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Coverage Map */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Coverage Areas</h2>
          <p className="text-muted-foreground mb-8">
            We broadcast across major metropolitan areas. Stream online for global coverage.
          </p>
          
          <Card className="bg-card border-border overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-[2/1] bg-secondary/30 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Signal className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">DAB Coverage</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Pulse Radio is available on DAB digital radio in London, Manchester, Birmingham, Leeds, 
                    Glasgow, and more UK cities. Can&apos;t find us? Stream online instead!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-3 gap-6 mt-8">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">London</h4>
                <p className="text-sm text-muted-foreground">Block 11D - 222.064 MHz</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Manchester</h4>
                <p className="text-sm text-muted-foreground">Block 12B - 225.648 MHz</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Birmingham</h4>
                <p className="text-sm text-muted-foreground">Block 11C - 220.352 MHz</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Smart Speakers */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30 overflow-hidden">
            <CardContent className="p-8 sm:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Headphones className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
                </div>
                <div className="text-center md:text-left flex-1">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">Smart Speaker Compatible</h2>
                  <p className="text-muted-foreground max-w-xl">
                    Just say &quot;Play Pulse Radio&quot; to your Alexa, Google Home, or Siri-enabled device. 
                    We&apos;re available on all major smart speaker platforms.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline">Alexa</Button>
                  <Button variant="outline">Google</Button>
                  <Button variant="outline">Siri</Button>
                </div>
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
