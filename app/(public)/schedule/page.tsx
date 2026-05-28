"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { LivePlayer } from "@/components/live-player"
import { schedule, djs } from "@/data/radio-data"

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

export default function SchedulePage() {
  const [selectedDay, setSelectedDay] = useState(new Date().getDay())

  const daySchedule = schedule
    .filter((slot) => slot.dayOfWeek === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  const getCurrentShow = () => {
    const now = new Date()
    const currentTime = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0")
    const currentDay = now.getDay()

    return schedule.find((slot) => {
      if (slot.dayOfWeek !== currentDay) return false
      return currentTime >= slot.startTime && currentTime < slot.endTime
    })
  }

  const currentShow = getCurrentShow()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pb-20">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Schedule</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Check out when your favorite DJs are on air. All times are in your local timezone.
            </p>
          </div>

          {/* Current Show */}
          {currentShow && (
            <Card className="bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30 mb-8">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                  </span>
                  <span className="text-sm font-medium text-accent uppercase tracking-wider">
                    On Air Now
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {(() => {
                    const dj = djs.find((d) => d.id === currentShow.djId)
                    return dj ? (
                      <>
                        <div className="relative w-16 h-16 rounded-full overflow-hidden">
                          <Image
                            src={dj.image}
                            alt={dj.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">{currentShow.showName}</h2>
                          <Link href={`/djs/${dj.slug}`} className="text-primary hover:underline">
                            {dj.name}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {currentShow.startTime} - {currentShow.endTime}
                          </p>
                        </div>
                      </>
                    ) : null
                  })()}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Day Selector */}
          <div className="flex overflow-x-auto gap-2 mb-8 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {daysOfWeek.map((day, index) => (
              <Button
                key={day}
                variant={selectedDay === index ? "default" : "outline"}
                onClick={() => setSelectedDay(index)}
                className={`shrink-0 ${selectedDay === index ? "bg-primary hover:bg-primary/90" : ""}`}
              >
                {day}
                {index === new Date().getDay() && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Today
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          {/* Schedule Grid */}
          <div className="grid gap-4">
            {daySchedule.length > 0 ? (
              daySchedule.map((slot) => {
                const dj = djs.find((d) => d.id === slot.djId)
                const isLive = currentShow?.id === slot.id

                return (
                  <Card
                    key={slot.id}
                    className={`bg-card border-border ${isLive ? "ring-2 ring-primary" : ""}`}
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-20">
                          <p className="text-lg font-bold">{slot.startTime}</p>
                          <p className="text-sm text-muted-foreground">{slot.endTime}</p>
                        </div>
                        
                        <div className="w-px h-12 bg-border" />
                        
                        {dj && (
                          <>
                            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden shrink-0">
                              <Image
                                src={dj.image}
                                alt={dj.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold">{slot.showName}</h3>
                                {isLive && (
                                  <Badge className="bg-accent text-accent-foreground">
                                    Live Now
                                  </Badge>
                                )}
                              </div>
                              <Link
                                href={`/djs/${dj.slug}`}
                                className="text-sm text-primary hover:underline"
                              >
                                {dj.name}
                              </Link>
                              <p className="text-sm text-muted-foreground">{dj.genre}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No scheduled shows for {daysOfWeek[selectedDay]}. Check back later or browse other days.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <LivePlayer />
    </div>
  )
}
