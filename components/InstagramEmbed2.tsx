
"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    instgrm?: {
      Embeds?: {
        process: () => void;
      };
    };
  }
}

const INSTAGRAM_SCRIPT_ID = "instagram-embed-script";

function loadInstagramScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.instgrm?.Embeds) {
      resolve();
      return;
    }

    let script = document.getElementById(
      INSTAGRAM_SCRIPT_ID
    ) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.id = INSTAGRAM_SCRIPT_ID;
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      document.body.appendChild(script);
    }

    script.addEventListener("load", () => resolve(), {
      once: true,
    });

    script.addEventListener(
      "error",
      () => reject(new Error("Instagram embed script failed to load")),
      { once: true }
    );
  });
}

export default function InstagramEmbed({
  url,
}: {
  url: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function renderEmbed() {
      try {
        setError("");

        const response = await fetch(
          `/api/instagram-embed?url=${encodeURIComponent(url)}`
        );

        if (!response.ok) {
          throw new Error("Could not retrieve Instagram post");
        }

        const data = await response.json();

        if (!data.html) {
          throw new Error("Instagram returned no embed HTML");
        }

        if (cancelled || !containerRef.current) return;

        containerRef.current.innerHTML = data.html;

        await loadInstagramScript();

        if (!cancelled) {
          window.instgrm?.Embeds?.process();
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Instagram embed failed"
          );
        }
      }
    }

    renderEmbed();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div className="w-full min-w-0">
      <div
        ref={containerRef}
        className="mx-auto w-full max-w-[540px] overflow-hidden"
      />

      {error && (
        <p className="p-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
