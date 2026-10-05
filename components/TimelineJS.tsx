"use client";

import { useEffect, useRef } from "react";

export type TimelineMedia =
  | {
      type: "image";
      url: string;
      caption?: string;
      credit?: string;
    }
  | {
      type: "youtube";
      url: string;
    }
  | {
      type: "instagram";
      url: string;
    }
  | {
      type: "tiktok";
      url: string;
    };

export interface TimelineEvent {
  id?: string;

  start_date: {
    year: number;
    month?: number;
    day?: number;
    hour?: number;
    minute?: number;
  };

  end_date?: {
    year: number;
    month?: number;
    day?: number;
    hour?: number;
    minute?: number;
  };

  title: string;

  text?: string;

  media?: TimelineMedia;

  group?: string;

  background?: string;
}

interface TimelineJSProps {
  events: TimelineEvent[];
  height?: string;
  className?: string;
}

declare global {
  interface Window {
    TL?: any;

    instgrm?: {
      Embeds?: {
        process?: () => void;
      };
    };

    tiktokEmbed?: {
      lib?: {
        render?: () => void;
      };
    };
  }
}

function loadScript(
  id: string,
  src: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(id);

    if (existing) {
      if ((existing as HTMLScriptElement).dataset.loaded === "true") {
        resolve();
        return;
      }

      existing.addEventListener("load", () => resolve(), {
        once: true,
      });

      existing.addEventListener("error", () => reject(), {
        once: true,
      });

      return;
    }

    const script = document.createElement("script");

    script.id = id;
    script.src = src;
    script.async = true;

    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };

    script.onerror = () => {
      reject(
        new Error(`Failed to load ${src}`)
      );
    };

    document.head.appendChild(script);
  });
}

function loadStylesheet(
  id: string,
  href: string
) {
  if (document.getElementById(id)) {
    return;
  }

  const link = document.createElement("link");

  link.id = id;
  link.rel = "stylesheet";
  link.href = href;

  document.head.appendChild(link);
}

function getYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (parsed.hostname === "youtu.be") {
      return parsed.pathname
        .replace("/", "")
        .split("?")[0];
    }

    if (
      parsed.hostname === "youtube.com" ||
      parsed.hostname === "www.youtube.com"
    ) {
      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v");
      }

      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/")[2];
      }

      if (parsed.pathname.startsWith("/shorts/")) {
        return parsed.pathname.split("/")[2];
      }
    }

    return null;
  } catch {
    return null;
  }
}

function getInstagramUrl(url: string) {
  return (
    url
      .split("?")[0]
      .replace(/\/$/, "") + "/"
  );
}

function getTikTokId(url: string): string | null {
  try {
    const parsed = new URL(url);

    const match =
      parsed.pathname.match(/\/video\/(\d+)/);

    return match?.[1] || null;
  } catch {
    return null;
  }
}

function createMedia(media?: TimelineMedia) {
  if (!media) {
    return undefined;
  }

  /*
   * Normal image
   */
  if (media.type === "image") {
    return {
      url: media.url,
      caption: media.caption || "",
      credit: media.credit || "",
    };
  }

  /*
   * YouTube
   *
   * TimelineJS natively understands YouTube URLs.
   */
  if (media.type === "youtube") {
    const videoId = getYouTubeId(media.url);

    if (!videoId) {
      return {
        url: media.url,
      };
    }

    return {
      url: `https://www.youtube.com/watch?v=${videoId}`,
    };
  }

  /*
   * Instagram
   */
  if (media.type === "instagram") {
    const instagramUrl =
      getInstagramUrl(media.url);

    return {
      url: instagramUrl,

      html: `
        <blockquote
          class="instagram-media"
          data-instgrm-permalink="${instagramUrl}"
          data-instgrm-version="14"
          style="
            background:#FFF;
            border:0;
            border-radius:3px;
            box-shadow:
              0 0 1px 0 rgba(0,0,0,0.5),
              0 1px 10px 0 rgba(0,0,0,0.15);
            margin:1px;
            max-width:540px;
            min-width:326px;
            padding:0;
            width:calc(100% - 2px);
          "
        ></blockquote>
      `,
    };
  }

  /*
   * TikTok
   */
  if (media.type === "tiktok") {
    const videoId = getTikTokId(media.url);

    if (!videoId) {
      return {
        url: media.url,
      };
    }

    return {
      url: media.url,

      html: `
        <blockquote
          class="tiktok-embed"
          cite="${media.url}"
          data-video-id="${videoId}"
          style="
            max-width:605px;
            min-width:325px;
          "
        >
          <section>
            <a
              target="_blank"
              href="${media.url}"
            >
              View this TikTok
            </a>
          </section>
        </blockquote>
      `,
    };
  }

  return undefined;
}

function convertEvents(
  events: TimelineEvent[]
) {
  return events.map((event, index) => {
    const slide: any = {
      unique_id:
        event.id || `timeline-${index}`,

      start_date: {
        year: event.start_date.year,
      },

      text: {
        headline: event.title,
        text: event.text || "",
      },
    };

    if (event.start_date.month) {
      slide.start_date.month =
        event.start_date.month;
    }

    if (event.start_date.day) {
      slide.start_date.day =
        event.start_date.day;
    }

    if (event.start_date.hour) {
      slide.start_date.hour =
        event.start_date.hour;
    }

    if (event.start_date.minute) {
      slide.start_date.minute =
        event.start_date.minute;
    }

    if (event.end_date) {
      slide.end_date = {
        year: event.end_date.year,
      };

      if (event.end_date.month) {
        slide.end_date.month =
          event.end_date.month;
      }

      if (event.end_date.day) {
        slide.end_date.day =
          event.end_date.day;
      }

      if (event.end_date.hour) {
        slide.end_date.hour =
          event.end_date.hour;
      }

      if (event.end_date.minute) {
        slide.end_date.minute =
          event.end_date.minute;
      }
    }

    if (event.group) {
      slide.group = event.group;
    }

    if (event.background) {
      slide.background = {
        color: event.background,
      };
    }

    const media =
      createMedia(event.media);

    if (media) {
      slide.media = media;
    }

    return slide;
  });
}

export default function TimelineJS({
  events,
  height = "700px",
  className = "",
}: TimelineJSProps) {
  const containerRef =
    useRef<HTMLDivElement>(null);

  const timelineRef =
    useRef<any>(null);

  /*
   * Load TimelineJS from Knight Lab.
   */
  useEffect(() => {
    loadStylesheet(
      "timelinejs-css",
      "https://cdn.knightlab.com/libs/timeline3/latest/css/timeline.css"
    );

    loadScript(
      "timelinejs-script",
      "https://cdn.knightlab.com/libs/timeline3/latest/js/timeline.js"
    ).catch((error) => {
      console.error(
        "TimelineJS failed to load:",
        error
      );
    });
  }, []);

  /*
   * Load Instagram.
   */
  useEffect(() => {
    loadScript(
      "instagram-embed-script",
      "https://www.instagram.com/embed.js"
    ).catch((error) => {
      console.error(
        "Instagram embed failed:",
        error
      );
    });
  }, []);

  /*
   * Load TikTok.
   */
  useEffect(() => {
    loadScript(
      "tiktok-embed-script",
      "https://www.tiktok.com/embed.js"
    ).catch((error) => {
      console.error(
        "TikTok embed failed:",
        error
      );
    });
  }, []);

  /*
   * Create TimelineJS after the CDN library
   * has loaded.
   */
  useEffect(() => {
    let cancelled = false;

    async function createTimeline() {
      if (!containerRef.current) {
        return;
      }

      try {
        await loadScript(
          "timelinejs-script",
          "https://cdn.knightlab.com/libs/timeline3/latest/js/timeline.js"
        );

        if (cancelled) {
          return;
        }

        if (!window.TL?.Timeline) {
          console.error(
            "TimelineJS loaded but TL.Timeline is unavailable."
          );

          return;
        }

        /*
         * Destroy existing timeline.
         */
        if (timelineRef.current) {
          try {
            timelineRef.current.destroy();
          } catch {
            // Ignore
          }

          timelineRef.current = null;
        }

        /*
         * Clear container.
         */
        containerRef.current.innerHTML = "";

        /*
         * Convert our events to TimelineJS data.
         */
        const data = {
          events: convertEvents(events),
        };

        /*
         * Create TimelineJS.
         */
        timelineRef.current =
          new window.TL.Timeline(
            containerRef.current,
            data,
            {
              height,

              hash_bookmark: false,

              initial_zoom: 2,

              timenav_position:
                "bottom",

              start_at_end: false,

              debug: false,
            }
          );

        /*
         * Give the social embed libraries
         * time to process the new DOM.
         */
        window.setTimeout(() => {
          processSocialEmbeds();
        }, 1000);

      } catch (error) {
        console.error(
          "Failed to create TimelineJS:",
          error
        );
      }
    }

    createTimeline();

    return () => {
      cancelled = true;

      if (timelineRef.current) {
        try {
          timelineRef.current.destroy();
        } catch {
          // Ignore
        }

        timelineRef.current = null;
      }
    };
  }, [events, height]);

  /*
   * Process Instagram and TikTok embeds.
   */
  function processSocialEmbeds() {
    try {
      if (
        window.instgrm?.Embeds?.process
      ) {
        window.instgrm.Embeds.process();
      }
    } catch (error) {
      console.error(
        "Instagram processing failed:",
        error
      );
    }

    try {
      if (
        window.tiktokEmbed?.lib?.render
      ) {
        window.tiktokEmbed.lib.render();
      }
    } catch (error) {
      console.error(
        "TikTok processing failed:",
        error
      );
    }
  }

  return (
    <div
      className={`w-full overflow-hidden ${className}`}
      style={{ height }}
    >
      <div
        ref={containerRef}
        className="h-full w-full"
      />
    </div>
  );
}