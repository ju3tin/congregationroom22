"use client";

import {
  CalendarDays,
  CircleDot,
  Image as ImageIcon,
  Instagram,
  Music2,
  Youtube,
} from "lucide-react";

import type {
  CR22ArchiveIndexEvent,
  CR22ArchiveMediaType,
} from "./CR22ArchiveTypes";

interface Props {
  events: CR22ArchiveIndexEvent[];
  activeEventKey: string;
  onSelect: (event: CR22ArchiveIndexEvent) => void;
}

function MediaIcon({ type }: { type: CR22ArchiveMediaType }) {
  const iconProps = { size: 17, strokeWidth: 1.8 };

  switch (type) {
    case "instagram":
      return <Instagram {...iconProps} />;
    case "tiktok":
      return <Music2 {...iconProps} />;
    case "youtube":
      return <Youtube {...iconProps} />;
    case "image":
      return <ImageIcon {...iconProps} />;
    default:
      return <CircleDot {...iconProps} />;
  }
}

function dateParts(date: CR22ArchiveIndexEvent["start_date"]) {
  const parsed = new Date(
    Date.UTC(date.year, (date.month ?? 1) - 1, date.day ?? 1)
  );

  return {
    day: new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      timeZone: "UTC",
    }).format(parsed),
    month: new Intl.DateTimeFormat("en-GB", {
      month: "short",
      timeZone: "UTC",
    }).format(parsed),
    year: date.year,
  };
}

export default function CR22ArchiveDateNav({
  events,
  activeEventKey,
  onSelect,
}: Props) {
  return (
    <section
      aria-label="CR22 archive timeline navigation"
      className="border-t border-white/10 bg-neutral-950/95 text-white backdrop-blur"
    >
      <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-3">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-neutral-400" />
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-300">
            Archive timeline
          </h2>
        </div>
        <span className="text-xs text-neutral-500">
          {events.length} {events.length === 1 ? "event" : "events"}
        </span>
      </div>

      {events.length === 0 ? (
        <p className="px-4 pb-4 text-sm text-neutral-500">
          No dates match the current filters.
        </p>
      ) : (
        <div className="overflow-x-auto overscroll-x-contain px-4 pb-4">
          <div className="flex min-w-max items-stretch gap-2">
            {events.map((event, index) => {
              const active = event.key === activeEventKey;
              const date = dateParts(event.start_date);
              const previousYear =
                index > 0 &&
                events[index - 1].start_date.year !==
                  event.start_date.year;

              return (
                <div key={event.key} className="flex items-stretch gap-2">
                  {previousYear && (
                    <div className="flex items-center border-l border-white/20 pl-3 text-xs font-semibold text-neutral-500">
                      {date.year}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => onSelect(event)}
                    aria-current={active ? "date" : undefined}
                    aria-label={`${date.day} ${date.month} ${date.year}: ${event.title}`}
                    title={`${date.day} ${date.month} ${date.year} — ${event.title}`}
                    className={[
                      "relative flex w-24 flex-col items-center rounded-lg border px-2 pb-3 pt-3 text-center transition",
                      active
                        ? "border-white bg-white text-black"
                        : "border-white/10 bg-white/[0.03] text-neutral-300 hover:border-white/40 hover:bg-white/[0.08]",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-full",
                        active ? "bg-black" : "bg-white/20",
                      ].join(" ")}
                    />

                    <span className="mb-1">
                      <MediaIcon type={event.mediaType || "other"} />
                    </span>
                    <span className="text-lg font-semibold leading-tight">
                      {date.day}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider opacity-70">
                      {date.month} {date.year}
                    </span>
                    <span className="mt-2 line-clamp-2 w-full text-[10px] leading-tight opacity-75">
                      {event.title}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}