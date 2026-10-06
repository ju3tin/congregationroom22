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

    tiktokEmbed?: {
      lib?: {
        render?: () => void;
      };
    };
  }
}

const TIMELINE_JS =
  "https://cdn.knightlab.com/libs/timeline3/latest/js/timeline.js";

const TIMELINE_CSS =
  "https://cdn.knightlab.com/libs/timeline3/latest/css/timeline.css";

const TIKTOK_JS =
  "https://www.tiktok.com/embed.js";

/* -------------------------------------------------------------------------- */
/* Script loader                                                               */
/* -------------------------------------------------------------------------- */

function loadScript(
  id: string,
  src: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing =
      document.getElementById(id);

    if (existing) {
      const script =
        existing as HTMLScriptElement;

      if (
        script.dataset.loaded === "true"
      ) {
        resolve();
        return;
      }

      script.addEventListener(
        "load",
        () => resolve(),
        { once: true }
      );

      script.addEventListener(
        "error",
        () =>
          reject(
            new Error(
              `Failed to load ${src}`
            )
          ),
        { once: true }
      );

      return;
    }

    const script =
      document.createElement("script");

    script.id = id;
    script.src = src;
    script.async = true;

    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };

    script.onerror = () => {
      reject(
        new Error(
          `Failed to load ${src}`
        )
      );
    };

    document.head.appendChild(script);
  });
}

/* -------------------------------------------------------------------------- */
/* Stylesheet                                                                  */
/* -------------------------------------------------------------------------- */

function loadStylesheet(
  id: string,
  href: string
) {
  if (
    document.getElementById(id)
  ) {
    return;
  }

  const link =
    document.createElement("link");

  link.id = id;
  link.rel = "stylesheet";
  link.href = href;

  document.head.appendChild(link);
}

/* -------------------------------------------------------------------------- */
/* YouTube                                                                     */
/* -------------------------------------------------------------------------- */

function getYouTubeId(
  url: string
): string | null {
  try {
    const parsed =
      new URL(url);

    const hostname =
      parsed.hostname.toLowerCase();

    if (
      hostname === "youtu.be" ||
      hostname === "www.youtu.be"
    ) {
      return (
        parsed.pathname
          .replace(/^\/+/, "")
          .split("/")[0]
          .split("?")[0] || null
      );
    }

    if (
      hostname === "youtube.com" ||
      hostname === "www.youtube.com" ||
      hostname === "m.youtube.com"
    ) {
      if (
        parsed.pathname === "/watch"
      ) {
        return (
          parsed.searchParams.get(
            "v"
          ) || null
        );
      }

      if (
        parsed.pathname.startsWith(
          "/embed/"
        )
      ) {
        return (
          parsed.pathname
            .split("/")[2] || null
        );
      }

      if (
        parsed.pathname.startsWith(
          "/shorts/"
        )
      ) {
        return (
          parsed.pathname
            .split("/")[2] || null
        );
      }

      if (
        parsed.pathname.startsWith(
          "/live/"
        )
      ) {
        return (
          parsed.pathname
            .split("/")[2] || null
        );
      }
    }

    return null;
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Instagram URL                                                               */
/* -------------------------------------------------------------------------- */

function getInstagramEmbedUrl(
  url: string
): string | null {
  try {
    const parsed =
      new URL(url);

    const hostname =
      parsed.hostname
        .toLowerCase()
        .replace(/^www\./, "");

    if (
      hostname !==
      "instagram.com"
    ) {
      return null;
    }

    const match =
      parsed.pathname.match(
        /^\/(p|reel|tv)\/([^/]+)/
      );

    if (!match) {
      return null;
    }

    const type =
      match[1];

    const shortcode =
      match[2];

    return (
      `https://www.instagram.com/` +
      `${type}/${encodeURIComponent(
        shortcode
      )}/embed/`
    );
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Instagram media                                                             */
/* -------------------------------------------------------------------------- */

function createInstagramHTML(
  url: string
): string {
  const embedUrl =
    getInstagramEmbedUrl(url);

  if (!embedUrl) {
    return `
      <div
        style="
          padding:20px;
          font-family:Arial,Helvetica,sans-serif;
        "
      >
        Invalid Instagram URL
      </div>
    `;
  }

  return `
    <div
      style="
        width:100%;
        max-width:605px;
        margin:0 auto;
        display:flex;
        justify-content:center;
      "
    >

      <iframe
        src="${embedUrl}"
        width="100%"
        height="700"
        frameborder="0"
        scrolling="no"
        allowtransparency="true"
        allow="encrypted-media"
        loading="lazy"
        style="
          display:block;
          width:100%;
          max-width:540px;
          height:700px;
          border:0;
          border-radius:12px;
          background:#ffffff;
        "
        title="Instagram post"
      ></iframe>

    </div>
  `;
}

/* -------------------------------------------------------------------------- */
/* TikTok                                                                      */
/* -------------------------------------------------------------------------- */

function getTikTokId(
  url: string
): string | null {
  try {
    const parsed =
      new URL(url);

    const match =
      parsed.pathname.match(
        /\/video\/(\d+)/
      );

    return (
      match?.[1] || null
    );
  } catch {
    return null;
  }
}

function createTikTokHTML(
  url: string
): string {
  const videoId =
    getTikTokId(url);

  if (!videoId) {
    return `
      <div
        style="
          padding:20px;
          text-align:center;
        "
      >
        <a
          href="${url}"
          target="_blank"
          rel="noopener noreferrer"
        >
          View this TikTok
        </a>
      </div>
    `;
  }

  return `
    <blockquote
      class="tiktok-embed"
      cite="${url}"
      data-video-id="${videoId}"
      style="
        max-width:605px;
        min-width:325px;
        margin:0 auto;
      "
    >
      <section>
        <a
          href="${url}"
          target="_blank"
          rel="noopener noreferrer"
        >
          View this TikTok
        </a>
      </section>
    </blockquote>
  `;
}

/* -------------------------------------------------------------------------- */
/* Create TimelineJS media                                                     */
/* -------------------------------------------------------------------------- */

function createMedia(
  media?: TimelineMedia
): any {
  if (!media) {
    return undefined;
  }

  /* IMAGE */

  if (
    media.type === "image"
  ) {
    return {
      url: media.url,

      caption:
        media.caption || "",

      credit:
        media.credit || "",
    };
  }

  /* YOUTUBE */

  if (
    media.type === "youtube"
  ) {
    const videoId =
      getYouTubeId(
        media.url
      );

    if (!videoId) {
      return {
        url: media.url,
      };
    }

    return {
      url:
        `https://www.youtube.com/watch?v=${videoId}`,
    };
  }

  /* INSTAGRAM */

  if (
    media.type === "instagram"
  ) {
    /*
     * IMPORTANT
     *
     * We use the MEDIA area of TimelineJS,
     * just like TikTok.
     *
     * But we do NOT give TimelineJS the
     * real Instagram URL.
     *
     * The actual Instagram URL only exists
     * inside our custom iframe.
     */

    return {
      url:
        "https://www.example.com/",
      html:
        createInstagramHTML(
          media.url
        ),
    };
  }

  /* TIKTOK */

  if (
    media.type === "tiktok"
  ) {
    return {
      url: media.url,

      html:
        createTikTokHTML(
          media.url
        ),
    };
  }

  return undefined;
}

/* -------------------------------------------------------------------------- */
/* Convert events                                                              */
/* -------------------------------------------------------------------------- */

function convertEvents(
  events: TimelineEvent[]
) {
  return events.map(
    (event, index) => {
      const slide: any = {
        unique_id:
          event.id ||
          `timeline-${index}`,

        start_date: {
          year:
            event.start_date.year,
        },

        text: {
          headline:
            event.title,

          text:
            event.text || "",
        },
      };

      /* START DATE */

      if (
        event.start_date.month
      ) {
        slide.start_date.month =
          event.start_date.month;
      }

      if (
        event.start_date.day
      ) {
        slide.start_date.day =
          event.start_date.day;
      }

      if (
        event.start_date.hour
      ) {
        slide.start_date.hour =
          event.start_date.hour;
      }

      if (
        event.start_date.minute
      ) {
        slide.start_date.minute =
          event.start_date.minute;
      }

      /* END DATE */

      if (
        event.end_date
      ) {
        slide.end_date = {
          year:
            event.end_date.year,
        };

        if (
          event.end_date.month
        ) {
          slide.end_date.month =
            event.end_date.month;
        }

        if (
          event.end_date.day
        ) {
          slide.end_date.day =
            event.end_date.day;
        }

        if (
          event.end_date.hour
        ) {
          slide.end_date.hour =
            event.end_date.hour;
        }

        if (
          event.end_date.minute
        ) {
          slide.end_date.minute =
            event.end_date.minute;
        }
      }

      /* GROUP */

      if (
        event.group
      ) {
        slide.group =
          event.group;
      }

      /* BACKGROUND */

      if (
        event.background
      ) {
        slide.background = {
          color:
            event.background,
        };
      }

      /* MEDIA */

      const media =
        createMedia(
          event.media
        );

      if (media) {
        slide.media =
          media;
      }

      return slide;
    }
  );
}

/* -------------------------------------------------------------------------- */
/* TimelineJS component                                                        */
/* -------------------------------------------------------------------------- */

export default function TimelineJS({
  events,
  height = "700px",
  className = "",
}: TimelineJSProps) {
  const containerRef =
    useRef<HTMLDivElement>(
      null
    );

  const timelineRef =
    useRef<any>(null);

  /* Load CSS */

  useEffect(() => {
    loadStylesheet(
      "timelinejs-css",
      TIMELINE_CSS
    );
  }, []);

  /* Load TikTok */

  useEffect(() => {
    loadScript(
      "tiktok-embed-js",
      TIKTOK_JS
    ).catch((error) => {
      console.error(
        "TikTok script failed:",
        error
      );
    });
  }, []);

  /* Process TikTok */

  function processTikTokEmbeds() {
    try {
      if (
        window.tiktokEmbed
          ?.lib?.render
      ) {
        window.tiktokEmbed.lib.render();
      }
    } catch (error) {
      console.error(
        "TikTok processing error:",
        error
      );
    }
  }

  /* Initialise */

  useEffect(() => {
    let cancelled =
      false;

    async function initialise() {
      if (
        !containerRef.current
      ) {
        return;
      }

      try {
        await loadScript(
          "timelinejs-script",
          TIMELINE_JS
        );

        if (
          cancelled
        ) {
          return;
        }

        if (
          !window.TL?.Timeline
        ) {
          console.error(
            "TimelineJS did not initialise."
          );

          return;
        }

        /* Destroy old timeline */

        if (
          timelineRef.current
        ) {
          try {
            timelineRef.current.destroy();
          } catch {}

          timelineRef.current =
            null;
        }

        /* Clear */

        containerRef.current.innerHTML =
          "";

        /* Data */

        const data = {
          events:
            convertEvents(
              events
            ),
        };

        /* Create */

        timelineRef.current =
          new window.TL.Timeline(
            containerRef.current,
            data,
            {
              hash_bookmark:
                false,

              timenav_position:
                "bottom",

              start_at_end:
                false,

              initial_zoom:
                2,

              debug:
                false,

              language:
                "en",

              scale_factor:
                2,
            }
          );

        /*
         * TikTok needs time to render
         * its blockquote.
         */

        window.setTimeout(
          () => {
            if (
              !cancelled
            ) {
              processTikTokEmbeds();
            }
          },
          1500
        );

        window.setTimeout(
          () => {
            if (
              !cancelled
            ) {
              processTikTokEmbeds();
            }
          },
          3000
        );

      } catch (error) {
        console.error(
          "TimelineJS error:",
          error
        );
      }
    }

    initialise();

    return () => {
      cancelled =
        true;

      if (
        timelineRef.current
      ) {
        try {
          timelineRef.current.destroy();
        } catch {}

        timelineRef.current =
          null;
      }
    };
  }, [events]);

  return (
    <div
      className={`w-full overflow-hidden ${className}`}
      style={{
        height,
      }}
    >
      <div
        ref={containerRef}
        className="h-full w-full"
      />
    </div>
  );
}