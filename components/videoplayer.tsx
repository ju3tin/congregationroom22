"use client";

type VideoPlayerProps = {
  src: string;
};

export default function VideoPlayer({ src }: VideoPlayerProps) {
  return (
    <video
      controls
      playsInline
      preload="metadata"
      style={{ width: "100%", height: "auto" }}
    >
      <source src={src} type="video/mp4" />
      Your browser does not support video playback.
    </video>
  );
}