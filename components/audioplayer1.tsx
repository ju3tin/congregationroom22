"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ForwardIcon,
  PlayIcon,
  RewindIcon,
  PauseIcon,
} from "lucide-react";
import Image from "next/image";

// ✅ Import YOUR real data + helpers
import { mixes, getDjById, Mix } from "@/data/radio-data";

const AudioPlayer: React.FC = () => {
  // 🎵 Use mixes directly (no conversion needed)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentMix: Mix | undefined = mixes[currentTrackIndex];
  const currentDj = currentMix ? getDjById(currentMix.djId) : null;

  // ▶️ Play / Pause
  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // ⏭ Next
  const handleNext = () => {
    if (!mixes.length) return;
    setCurrentTrackIndex((prev) => (prev + 1) % mixes.length);
  };

  // ⏮ Prev
  const handlePrev = () => {
    if (!mixes.length) return;
    setCurrentTrackIndex((prev) =>
      prev === 0 ? mixes.length - 1 : prev - 1
    );
  };

  // ⏱ Progress update
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;

    const current = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 1;

    setCurrentTime(current);
    setProgress((current / dur) * 100);
  };

  // 📦 Metadata
  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  // 🔁 Auto next
  const handleEnded = () => {
    handleNext();
  };

  // 🔄 Load new track
  useEffect(() => {
    if (!audioRef.current || !currentMix) return;

    const audio = audioRef.current;

    audio.pause();
    audio.src = currentMix.downloadUrl;
    audio.load();

    setCurrentTime(0);
    setProgress(0);

    if (isPlaying) {
      audio.play();
    }
  }, [currentTrackIndex]);

  // ⏱ Format time
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="max-w-md w-full">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-8">

            {/* 🎨 Cover */}
            <Image
              src={currentMix?.coverImage || "/music.svg"}
              alt={currentMix?.title || "Cover"}
              width={120}
              height={120}
              className="rounded-full w-32 h-32 object-cover"
            />

            {/* 🎵 Info */}
            <div className="text-center">
              <h2 className="text-xl font-bold">
                {currentMix?.title || "No Track"}
              </h2>

              <p className="text-muted-foreground">
                {currentMix?.djName}
              </p>

              {/* ✨ Extra data from your structure */}
              <p className="text-xs text-muted-foreground mt-1">
                {currentMix?.genre} • {currentMix?.plays.toLocaleString()} plays
              </p>

              {/* 👤 DJ bio preview (optional flex) */}
              {currentDj && (
                <p className="text-xs mt-2 line-clamp-2">
                  {currentDj.bio}
                </p>
              )}
            </div>

            {/* 📊 Progress */}
            <div className="w-full">
              <Progress value={progress} />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* 🎛 Controls */}
            <div className="flex items-center gap-4">
              <Button onClick={handlePrev} variant="ghost" size="icon">
                <RewindIcon className="w-6 h-6" />
              </Button>

              <Button onClick={handlePlayPause} variant="ghost" size="icon">
                {isPlaying ? (
                  <PauseIcon className="w-6 h-6" />
                ) : (
                  <PlayIcon className="w-6 h-6" />
                )}
              </Button>

              <Button onClick={handleNext} variant="ghost" size="icon">
                <ForwardIcon className="w-6 h-6" />
              </Button>
            </div>

            {/* 🔊 Audio */}
            <audio
              ref={audioRef}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleEnded}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AudioPlayer;
