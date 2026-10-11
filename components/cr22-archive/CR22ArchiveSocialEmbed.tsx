"use client";

import { useState } from "react";
import { ExternalLink, LoaderCircle } from "lucide-react";

import type { CR22ArchiveEvent } from "./CR22ArchiveTypes";

interface Props {
  event: CR22ArchiveEvent;
}

function getInstagramEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (!/(^|\.)instagram\.com$/i.test(parsed.hostname)) return null;

    const match = parsed.pathname.match(
      /^\/(p|reel|tv)\/([A-Za-z0-9_-]+)/
    );

    return match
      ? `https://www.instagram.com/${match[1]}/${match[2]}/embed/`
      : null;
  } catch {
    return null;
  }
}

function getTikTokEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (!/(^|\.)tiktok\.com$/i.test(parsed.hostname)) return null;

    const match = parsed.pathname.match(/\/video\/(\d+)/);

    return match
      ? `https://www.tiktok.com/player/v1/${match[1]}?controls=1`
      : null;
  } catch {
    return null;
  }
}

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    let videoId: string | null = null;

    if (parsed.hostname.toLowerCase() === "youtu.be") {
      videoId = parsed.pathname.split("/").filter(Boolean)[0] || null;
    } else if (
      /(^|\.)youtube\.com$/i.test(parsed.hostname)
    ) {
      if (parsed.pathname === "/watch") {
        videoId = parsed.searchParams.get("v");
      } else {
        const match = parsed.pathname.match(
          /^\/(embed|shorts)\/([A-Za-z0-9_-]+)/
        );
        if (match) videoId = match[2];
      }
    }

    if (!videoId || !/^[A-Za-z0-9_-]+$/.test(videoId)) return null;

    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  } catch {
    return null;
  }
}

export default function CR22ArchiveSocialEmbed({ event }: Props) {
  const [loadedUrl, setLoadedUrl] = useState("");

  const media = event.media;
  const url = media?.url?.trim() || "";
  const type = (media?.type || "").toLowerCase();

  if (!url) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] p-6 text-sm text-neutral-500">
        No media available for this event.
      </div>
    );
  }

  const isImage =
    type.includes("image") ||
    /\.(jpg|jpeg|png|gif|webp|avif)(\?.*)?$/i.test(url);

  if (isImage) {
    return (
      <figure className="overflow-hidden rounded-xl bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={media?.caption || event.title}
          loading="lazy"
          className="mx-auto max-h-[75vh] w-full object-contain"
        />
        {media?.caption && (
          <figcaption className="p-3 text-sm text-neutral-400">
            {media.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  const instagramUrl =
    type.includes("instagram") || /instagram\.com/i.test(url)
      ? getInstagramEmbedUrl(url)
      : null;

  const tiktokUrl =
    type.includes("tiktok") || /tiktok\.com/i.test(url)
      ? getTikTokEmbedUrl(url)
      : null;

  const youtubeUrl =
    type.includes("youtube") ||
    /youtu\.be|youtube\.com/i.test(url)
      ? getYouTubeEmbedUrl(url)
      : null;

  const embedUrl = instagramUrl || tiktokUrl || youtubeUrl;
  const embedLoaded = loadedUrl === embedUrl;

  if (embedUrl) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black">
        {!embedLoaded && (
          <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-neutral-950 text-sm text-neutral-400">
            <LoaderCircle size={18} className="animate-spin" />
            Loading media…
          </div>
        )}

        <iframe
          key={`${event._id || event.id || event.title}-${embedUrl}`}
          src={embedUrl}
          title={event.title}
          loading="eager"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setLoadedUrl(embedUrl)}
          className={[
            "block w-full border-0 transition-opacity",
            instagramUrl ? "h-[600px] max-h-[75vh]" : "aspect-video",
            embedLoaded ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-8 text-sm text-neutral-300 transition hover:bg-white/[0.08]"
    >
      Open original media
      <ExternalLink size={16} />
    </a>
  );
}