"use client";

import { useEffect, useState } from "react";

interface MixcloudPlayerProps {
  apiUrl: string;
  height?: number;
  color?: string;
}

interface MixcloudApiResponse {
  iframeUrl?: string;
  error?: string;
}

export default function MixcloudPlayer({
  apiUrl,
  height = 180,
  color = "2563eb",
}: MixcloudPlayerProps) {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiUrl) {
      setError("Missing Mixcloud URL");
      return;
    }

    async function loadPlayer() {
      try {
        setError(null);
        setIframeUrl(null);

        const response = await fetch(
          `/api/mixcloud?url=${encodeURIComponent(apiUrl)}`
        );

        const data: MixcloudApiResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load Mixcloud"
          );
        }

        if (!data.iframeUrl) {
          throw new Error(
            "No Mixcloud player URL returned"
          );
        }

        setIframeUrl(data.iframeUrl);
      } catch (error) {
        console.error("Mixcloud player error:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load Mixcloud player"
        );
      }
    }

    loadPlayer();
  }, [apiUrl]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (!iframeUrl) {
    return (
      <div
        className="flex items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-500"
        style={{ height }}
      >
        Loading Mixcloud...
      </div>
    );
  }

  const separator = iframeUrl.includes("?") ? "&" : "?";

  const finalUrl =
    `${iframeUrl}${separator}` +
    `color=${encodeURIComponent(color)}`;

  return (
    <iframe
      src={finalUrl}
      width="100%"
      height={height}
      frameBorder="0"
      allow="autoplay"
      scrolling="no"
      title="Mixcloud player"
      className="w-full"
    />
  );
}