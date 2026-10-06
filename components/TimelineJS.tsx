"use client";

import { useEffect, useRef } from "react";

const TIMELINE_JS =
  "https://cdn.knightlab.com/libs/timeline3/latest/js/timeline.js";

const TIMELINE_CSS =
  "https://cdn.knightlab.com/libs/timeline3/latest/css/timeline.css";

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
    second?: number;
  };

  end_date?: {
    year: number;
    month?: number;
    day?: number;
    hour?: number;
    minute?: number;
    second?: number;
  };

  title: string;
  text?: string;

  media?: TimelineMedia;

  group?: string;

  background?: {
    color?: string;
    url?: string;
  };
}

interface TimelineJSProps {
  events: TimelineEvent[];
  height?: string;
  className?: string;
}

declare global {
  interface Window {
    TL?: any;
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(
      `script[src="${src}"]`
    ) as HTMLScriptElement | null;

    if (existing) {
      if (window.TL) {
        resolve();
        return;
      }

      existing.addEventListener(
        "load",
        () => resolve(),
        { once: true }
      );

      existing.addEventListener(
        "error",
        reject,
        { once: true }
      );

      return;
    }

    const script =
      document.createElement("script");

    script.src = src;
    script.async = true;

    script.onload = () => resolve();

    script.onerror = () =>
      reject(
        new Error(
          `Failed to load ${src}`
        )
      );

    document.head.appendChild(script);
  });
}

function loadStylesheet(href: string) {
  if (
    document.querySelector(
      `link[href="${href}"]`
    )
  ) {
    return;
  }

  const link =
    document.createElement("link");

  link.rel = "stylesheet";
  link.href = href;

  document.head.appendChild(link);
}

function getYoutubeId(
  url: string
): string | null {
  try {
    const parsed = new URL(url);

    if (
      parsed.hostname ===
      "youtu.be"
    ) {
      return (
        parsed.pathname
          .replace("/", "")
          .split("/")[0] || null
      );
    }

    if (
      parsed.hostname.includes(
        "youtube.com"
      ) ||
      parsed.hostname.includes(
        "youtube-nocookie.com"
      )
    ) {
      if (
        parsed.pathname ===
        "/watch"
      ) {
        return parsed.searchParams.get(
          "v"
        );
      }

      if (
        parsed.pathname.startsWith(
          "/embed/"
        )
      ) {
        return (
          parsed.pathname.split(
            "/"
          )[2] || null
        );
      }

      if (
        parsed.pathname.startsWith(
          "/shorts/"
        )
      ) {
        return (
          parsed.pathname.split(
            "/"
          )[2] || null
        );
      }

      if (
        parsed.pathname.startsWith(
          "/live/"
        )
      ) {
        return (
          parsed.pathname.split(
            "/"
          )[2] || null
        );
      }
    }
  } catch {
    return null;
  }

  return null;
}

function getInstagramUrl(
  url: string
): string {
  const match = url.match(
    /https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/[^/?#]+/
  );

  if (match) {
    return `${match[0]}/`;
  }

  return url;
}

function getTikTokId(
  url: string
): string | null {
  const match = url.match(
    /\/video\/(\d+)/
  );

  return match?.[1] || null;
}

function createInstagramHTML(
  url: string
): string {
  const cleanUrl =
    getInstagramUrl(url);

  return `
    <div
      class="timeline-instagram-wrapper"
      style="
        width:100%;
        max-width:540px;
        margin:0 auto;
        display:flex;
        justify-content:center;
        align-items:flex-start;
      "
    >
      <iframe
        src="${cleanUrl}embed/"
        title="Instagram post"
        style="
          width:100%;
          max-width:540px;
          height:700px;
          border:0;
          overflow:hidden;
          background:#fff;
        "
        scrolling="no"
        allowtransparency="true"
        allow="encrypted-media; clipboard-write; picture-in-picture; web-share"
      ></iframe>
    </div>
  `;
}

/*
 * TikTok's official Embed Player.
 *
 * Example:
 *
 * https://www.tiktok.com/player/v1/6718335390845095173
 */
function createTikTokHTML(
  url: string
): string | null {
  const videoId =
    getTikTokId(url);

  if (!videoId) {
    console.warn(
      "TikTok: couldn't find video ID",
      url
    );

    return null;
  }

  const playerUrl =
    `https://www.tiktok.com/player/v1/${videoId}` +
    `?controls=1` +
    `&description=1` +
    `&music_info=1` +
    `&loop=0`;

  return `
    <div
      class="timeline-tiktok-wrapper"
      style="
        width:100%;
        max-width:605px;
        margin:0 auto;
        display:flex;
        justify-content:center;
        align-items:flex-start;
      "
    >
      <iframe
        src="${playerUrl}"
        title="TikTok video"
        style="
          width:100%;
          max-width:605px;
          height:700px;
          border:0;
          background:#000;
        "
        allow="fullscreen"
        allowfullscreen
        scrolling="no"
      ></iframe>
    </div>
  `;
}

export default function TimelineJS({
  events,
  height = "750px",
  className = "",
}: TimelineJSProps) {
  const containerRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const timelineRef =
    useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    async function initTimeline() {
      if (
        !containerRef.current ||
        !events.length
      ) {
        return;
      }

      loadStylesheet(
        TIMELINE_CSS
      );

      await loadScript(
        TIMELINE_JS
      );

      if (
        cancelled ||
        !containerRef.current ||
        !window.TL
      ) {
        return;
      }

      /*
       * Destroy previous TimelineJS
       */
      if (timelineRef.current) {
        try {
          timelineRef.current.destroy?.();
        } catch {
          // Ignore cleanup errors
        }

        timelineRef.current =
          null;
      }

      containerRef.current.innerHTML =
        "";

      /*
       * Build TimelineJS events.
       */
      const timelineEvents =
        events.map(
          (event, index) => {
            const uniqueId =
              event.id ||
              `timeline-event-${index}`;

            const slide: any = {
              unique_id: uniqueId,

              start_date:
                event.start_date,

              /*
               * IMPORTANT:
               * TimelineJS expects the
               * headline/text inside
               * the text object.
               */
              text: {
                headline:
                  event.title,

                text:
                  event.text || "",
              },
            };

            if (event.end_date) {
              slide.end_date =
                event.end_date;
            }

            if (event.group) {
              slide.group =
                event.group;
            }

            if (
              event.background
            ) {
              slide.background =
                event.background;
            }

            /*
             * Normal image
             */
            if (
              event.media?.type ===
              "image"
            ) {
              slide.media = {
                url:
                  event.media.url,

                caption:
                  event.media
                    .caption || "",

                credit:
                  event.media
                    .credit || "",
              };
            }

            /*
             * YouTube
             */
            if (
              event.media?.type ===
              "youtube"
            ) {
              const youtubeId =
                getYoutubeId(
                  event.media.url
                );

              if (youtubeId) {
                slide.media = {
                  url:
                    `https://www.youtube.com/watch?v=${youtubeId}`,
                };
              }
            }

            /*
             * Instagram
             *
             * Don't give TimelineJS the
             * real Instagram URL.
             */
            if (
              event.media?.type ===
              "instagram"
            ) {
              slide.media = {
                url:
                  "https://example.com/",
              };
            }

            /*
             * TikTok
             *
             * Same approach as Instagram.
             */
            if (
              event.media?.type ===
              "tiktok"
            ) {
              slide.media = {
                url:
                  "https://example.com/",
              };
            }

            return slide;
          }
        );

      /*
       * Create TimelineJS.
       */
      const timeline =
        new window.TL.Timeline(
          containerRef.current,
          {
            events:
              timelineEvents,
          },
          {
            hash_bookmark: false,
            timenav_position:
              "bottom",
            start_at_end: false,
            initial_zoom: 2,
            debug: false,
            language: "en",
            scale_factor: 2,
          }
        );

      timelineRef.current =
        timeline;

      /*
       * Find the actual DOM element
       * belonging to a TimelineJS slide.
       */
      const findSlideElement = (
        uniqueId: string
      ): HTMLElement | null => {
        const root =
          containerRef.current;

        if (!root) {
          return null;
        }

        const escapedId =
          CSS.escape(uniqueId);

        const selectors = [
          `[data-unique-id="${escapedId}"]`,
          `[data-slide-id="${escapedId}"]`,
          `#${escapedId}`,
        ];

        for (const selector of selectors) {
          try {
            const found =
              root.querySelector<HTMLElement>(
                selector
              );

            if (found) {
              const slide =
                found.closest(
                  ".tl-slide"
                ) as HTMLElement | null;

              if (slide) {
                return slide;
              }

              return found;
            }
          } catch {
            // Continue
          }
        }

        /*
         * Fallback.
         */
        const slides =
          root.querySelectorAll<HTMLElement>(
            ".tl-slide"
          );

        for (const slide of slides) {
          if (
            slide.id === uniqueId ||
            slide.dataset
              .uniqueId ===
              uniqueId ||
            slide.dataset
              .slideId ===
              uniqueId
          ) {
            return slide;
          }

          if (
            slide.innerHTML.includes(
              uniqueId
            )
          ) {
            return slide;
          }
        }

        return null;
      };

      /*
       * Render Instagram.
       */
      const renderInstagram = (
        slideElement: HTMLElement,
        event: TimelineEvent
      ) => {
        if (
          !event.media ||
          event.media.type !==
            "instagram"
        ) {
          return;
        }

        const mediaContainer =
          slideElement.querySelector<HTMLElement>(
            ".tl-media"
          );

        if (!mediaContainer) {
          console.warn(
            "Instagram: couldn't find .tl-media"
          );

          return;
        }

        if (
          mediaContainer.querySelector(
            ".timeline-instagram-wrapper"
          )
        ) {
          return;
        }

        mediaContainer.innerHTML =
          createInstagramHTML(
            event.media.url
          );

        mediaContainer.style.display =
          "block";

        mediaContainer.style.visibility =
          "visible";

        mediaContainer.style.opacity =
          "1";
      };

      /*
       * Render TikTok.
       */
      const renderTikTok = (
        slideElement: HTMLElement,
        event: TimelineEvent
      ) => {
        if (
          !event.media ||
          event.media.type !==
            "tiktok"
        ) {
          return;
        }

        const mediaContainer =
          slideElement.querySelector<HTMLElement>(
            ".tl-media"
          );

        if (!mediaContainer) {
          console.warn(
            "TikTok: couldn't find .tl-media"
          );

          return;
        }

        /*
         * Don't duplicate iframe.
         */
        if (
          mediaContainer.querySelector(
            ".timeline-tiktok-wrapper"
          )
        ) {
          return;
        }

        const html =
          createTikTokHTML(
            event.media.url
          );

        if (!html) {
          return;
        }

        mediaContainer.innerHTML =
          html;

        mediaContainer.style.display =
          "block";

        mediaContainer.style.visibility =
          "visible";

        mediaContainer.style.opacity =
          "1";
      };

      /*
       * Render custom media for
       * the active slide.
       */
      const renderActiveMedia = (
        uniqueId: string
      ) => {
        const eventIndex =
          events.findIndex(
            (event, index) =>
              (event.id ||
                `timeline-event-${index}`) ===
              uniqueId
          );

        if (
          eventIndex === -1
        ) {
          return;
        }

        const event =
          events[eventIndex];

        if (
          !event.media ||
          (event.media.type !==
            "instagram" &&
            event.media.type !==
              "tiktok")
        ) {
          return;
        }

        let attempts = 0;

        const tryRender = () => {
          attempts++;

          const slideElement =
            findSlideElement(
              uniqueId
            );

          if (!slideElement) {
            if (attempts < 20) {
              window.setTimeout(
                tryRender,
                100
              );
            } else {
              console.warn(
                "Custom media: couldn't find slide DOM",
                uniqueId
              );
            }

            return;
          }

          if (
            event.media?.type ===
            "instagram"
          ) {
            renderInstagram(
              slideElement,
              event
            );
          }

          if (
            event.media?.type ===
            "tiktok"
          ) {
            renderTikTok(
              slideElement,
              event
            );
          }
        };

        tryRender();
      };

      /*
       * TimelineJS slide changed.
       */
      timeline.on(
        "change",
        (data: any) => {
          const uniqueId =
            data?.unique_id;

          if (!uniqueId) {
            return;
          }

          requestAnimationFrame(
            () => {
              requestAnimationFrame(
                () => {
                  renderActiveMedia(
                    uniqueId
                  );
                }
              );
            }
          );
        }
      );

      /*
       * Initial slide.
       */
      window.setTimeout(() => {
        try {
          const currentSlide =
            timeline._storyslider
              ?._current_slide;

          const uniqueId =
            currentSlide?.data
              ?.unique_id;

          if (uniqueId) {
            renderActiveMedia(
              uniqueId
            );
          }
        } catch {
          // Nothing to do
        }
      }, 500);
    }

    initTimeline().catch(
      (error) => {
        console.error(
          "TimelineJS initialization failed:",
          error
        );
      }
    );

    return () => {
      cancelled = true;

      if (timelineRef.current) {
        try {
          timelineRef.current.destroy?.();
        } catch {
          // Ignore cleanup errors
        }

        timelineRef.current =
          null;
      }
    };
  }, [events]);

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