"use client";

import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react";

import CR22ArchiveSocialEmbed from "./CR22ArchiveSocialEmbed";
import {
  cr22ArchivePlainText,
  formatCR22ArchiveDate,
  type CR22ArchiveEvent,
} from "./CR22ArchiveTypes";

interface Props {
  event: CR22ArchiveEvent;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

export default function CR22ArchiveEventPanel({
  event,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: Props) {
  const description = cr22ArchivePlainText(event.text);

  return (
    <article className="mx-auto max-w-5xl">
      <div className="mb-5 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.15em] text-neutral-400">
        <CalendarDays size={15} />
        <time>
          {formatCR22ArchiveDate(event.start_date, true)}
        </time>
        {event.group && (
          <span className="rounded-full border border-white/15 px-3 py-1 normal-case tracking-normal">
            {event.group}
          </span>
        )}
      </div>

      <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-5xl">
        {event.title}
      </h2>

      <div className="mb-7">
        <CR22ArchiveSocialEmbed
          key={event._id || event.id || event.title}
          event={event}
        />
      </div>

      {description && (
        <p className="max-w-3xl whitespace-pre-line text-base leading-7 text-neutral-300">
          {description}
        </p>
      )}

      {event.media?.credit && (
        <p className="mt-4 text-xs text-neutral-500">
          Credit: {event.media.credit}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!hasPrevious}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-neutral-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowLeft size={16} />
          Previous
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-neutral-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Next
          <ArrowRight size={16} />
        </button>
      </div>
    </article>
  );
}