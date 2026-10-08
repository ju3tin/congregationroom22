"use client";

import { useEffect, useRef, useState } from "react";

interface MixcloudPlayerProps {
  apiUrl: string;
  height?: number;
  color?: string;
  width?: string | number;
  hideCover?: boolean;
  hideTracklist?: boolean;
  mini?: boolean;
  light?: boolean;
}

export default function MixcloudPlayer({
  apiUrl,
  height = 180,
  color = "2563eb",
  width = "100%",
  hideCover = false,
  hideTracklist = false,
  mini = false,
  light = false,
}: MixcloudPlayerProps) {
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    async function loadPlayer() {
      if (!apiUrl) {
        setError("Missing Mixcloud API URL");
        return;
      }

      try {
        setError(null);
        setIframeSrc(null);

        // Make sure we are using the API show URL
        const cleanUrl = apiUrl.replace(/\/+$/, "");

        const embedUrl =
          `${cleanUrl}/embed-html/` +
          `?width=${encodeURIComponent(String(width))}` +
          `&height=${encodeURIComponent(String(height))}` +
          `&color=${encodeURIComponent(color)}` +
          `&hide_cover=${hideCover}` +
          `&hide_tracklist=${hideTracklist}` +
          `&mini=${mini}` +
          `&light=${light}`;

        const response = await fetch(embedUrl);

        if (!response.ok) {
          throw new Error(
            `Mixcloud returned ${response.status}`
          );
        }

        const html = await response.text();

        // Find the iframe src returned by Mixcloud
        const match = html.match(
          /<iframe[^>]+src=["']([^"']+)["']/i
        );

        if (!match?.[1]) {
          console.error("Mixcloud embed response:", html);
          throw new Error("Could not find Mixcloud player iframe");
        }

        let src = match[1];

        // Handle HTML encoded URLs
        src = src
          .replace(/&amp;/g, "&")
          .replace(/&#x2F;/g, "/");

        if (mounted.current) {
          setIframeSrc(src);
        }
      } catch (err) {
        console.error("Mixcloud player error:", err);

        if (mounted.current) {
          setError("Unable to load Mixcloud player");
        }
      }
    }

    loadPlayer();
  }, [
    apiUrl,
    height,
    color,
    width,
    hideCover,
    hideTracklist,
    mini,
    light,
  ]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (!iframeSrc) {
    return (
      <div
        className="flex items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-500"
        style={{
          width,
          height,
        }}
      >
        Loading Mixcloud...
      </div>
    );
  }

  return (
    <iframe
      src={iframeSrc}
      width={width}
      height={height}
      frameBorder="0"
      allow="autoplay"
      scrolling="no"
      title="Mixcloud player"
      className="w-full rounded-lg"
    />
  );
}