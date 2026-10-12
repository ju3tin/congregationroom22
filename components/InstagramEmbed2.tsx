
"use client";

import { useEffect, useRef, useState } from "react";

type InstagramEmbedProps = {
  url: string;
};

declare global {
  interface Window {
    instgrm?: {
      Embeds?: {
        process: () => void;
      };
    };
  }
}

export default function InstagramEmbed({
  url,
}: InstagramEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadEmbed() {
      setLoading(true);
      setError("");
      setHtml("");

      try {
        const response = await fetch(
          `/api/instagram-embed?url=${encodeURIComponent(url)}`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load Instagram embed"
          );
        }

        setHtml(data.html);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load Instagram embed"
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    if (url) {
      loadEmbed();
    } else {
      setLoading(false);
      setError("No Instagram URL provided");
    }

    return () => controller.abort();
  }, [url]);

  useEffect(() => {
    const container = containerRef.current;

    if (!html || !container) return;

    // The HTML is returned by Meta's oEmbed endpoint.
    container.innerHTML = html;

    function processEmbeds() {
      window.instgrm?.Embeds?.process();
    }

    const scriptId = "instagram-embed-script";
    let script = document.getElementById(
      scriptId
    ) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      document.body.appendChild(script);
    }

    if (window.instgrm?.Embeds) {
      processEmbeds();
    } else {
      script.addEventListener("load", processEmbeds, {
        once: true,
      });
    }

    return () => {
      script?.removeEventListener("load", processEmbeds);
    };
  }, [html]);

  return (
    <div className="w-full min-w-0">
      {loading && (
        <p className="py-4 text-sm text-gray-500">
          Loading Instagram post...
        </p>
      )}

      {error && (
        <p role="alert" className="py-4 text-sm text-red-600">
          {error}
        </p>
      )}

      <div
        ref={containerRef}
        className="mx-auto w-full max-w-[658px] overflow-hidden"
      />
    </div>
  );
}
