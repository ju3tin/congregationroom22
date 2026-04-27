"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, Volume2, VolumeX, Radio } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { djs, schedule } from "@/data/radio-data"

export function LivePlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState([75])
  const [isMuted, setIsMuted] = useState(false)
  const [currentShow, setCurrentShow] = useState<{ djName: string; showName: string } | null>(null)

  // 🎧 STREAM URL
  const streamUrl = "https://orbit.citrus3.com:2020/stream/congregationroom22"

  useEffect(() => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const currentTime =
      now.getHours().toString().padStart(2, "0") +
      ":" +
      now.getMinutes().toString().padStart(2, "0")

    const activeSlot = schedule.find((slot) => {
      if (slot.dayOfWeek !== dayOfWeek) return false
      return currentTime >= slot.startTime && currentTime < slot.endTime
    })

    if (activeSlot) {
      const dj = djs.find((d) => d.id === activeSlot.djId)
      setCurrentShow({
        djName: dj?.name || "Unknown DJ",
        showName: activeSlot.showName,
      })
    } else {
      setCurrentShow({
        djName: "congregationroom22",
        showName: "Non-Stop Mix",
      })
    }
  }, [])

  // ▶️ Play / Pause control
  useEffect(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.play().catch((e) => console.error("Play failed:", e))
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying])

  // 🔊 Volume control
  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = (isMuted ? 0 : volume[0]) / 100
  }, [volume, isMuted])

  return (
    <>
      {/* 🎧 Hidden audio player */}
      <audio ref={audioRef} src={streamUrl} preload="none" />

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <Radio className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPlaying ? "bg-accent" : "bg-muted-foreground"}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? "bg-accent" : "bg-muted-foreground"}`}></span>
                  </span>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {isPlaying ? "Live" : "Paused"}
                  </span>
                </div>
                <p className="text-sm font-medium truncate">
                  {currentShow?.showName || "Loading..."}{" "}
                  <span className="text-muted-foreground">with</span>{" "}
                  {currentShow?.djName || "..."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-primary-foreground" />
                ) : (
                  <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                )}
              </Button>

              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)}>
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                <Slider
                  value={isMuted ? [0] : volume}
                  onValueChange={setVolume}
                  max={100}
                  step={1}
                  className="w-24"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
