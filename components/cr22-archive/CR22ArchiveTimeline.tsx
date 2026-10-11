"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";

import CR22ArchiveDateNav from "./CR22ArchiveDateNav";
import CR22ArchiveEventPanel from "./CR22ArchiveEventPanel";
import CR22ArchiveFilters from "./CR22ArchiveFilters";

import {
  getCR22ArchiveMediaType,
  type CR22ArchiveEvent,
  type CR22ArchiveIndexEvent,
  type CR22ArchiveMediaFilter,
} from "./CR22ArchiveTypes";

export default function CR22ArchiveTimeline() {
  const [indexEvents, setIndexEvents] = useState<CR22ArchiveIndexEvent[]>([]);
  const [activeEvent, setActiveEvent] = useState<CR22ArchiveEvent | null>(null);
  const [activeKey, setActiveKey] = useState("");
  const [filter, setFilter] = useState<CR22ArchiveMediaFilter>("all");
  const [search, setSearch] = useState("");
  const [indexLoading, setIndexLoading] = useState(true);
  const [eventLoading, setEventLoading] = useState(false);
  const [error, setError] = useState("");

  // Load all lightweight timeline markers.
  useEffect(() => {
    const controller = new AbortController();

    async function loadIndex() {
      try {
        setIndexLoading(true);
        setError("");

        const response = await fetch("/api/cr22-archive-index", {
          cache: "no-store",
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Unable to load archive dates.");
        }

        const events: CR22ArchiveIndexEvent[] = (data.events || []).map(
          (item: CR22ArchiveIndexEvent) => ({
            ...item,
            mediaType: getCR22ArchiveMediaType(item.mediaType),
          })
        );

        setIndexEvents(events);

        if (events.length > 0) {
          setActiveKey(events[0].key);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error ? err.message : "Unable to load archive dates."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIndexLoading(false);
        }
      }
    }

    void loadIndex();

    return () => controller.abort();
  }, []);

  const visibleEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return indexEvents.filter((event) => {
      const type = getCR22ArchiveMediaType(event.mediaType);

      const matchesFilter = filter === "all" || type === filter;

      const matchesSearch =
        !query ||
        event.title.toLowerCase().includes(query) ||
        String(event.start_date.year).includes(query) ||
        String(event.start_date.month ?? "").includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [indexEvents, filter, search]);

  const selectEvent = useCallback(async (event: CR22ArchiveIndexEvent) => {
    setActiveKey(event.key);
    setActiveEvent(null);
    setEventLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/cr22-archive-event?key=${encodeURIComponent(event.key)}`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to load this archive event.");
      }

      setActiveEvent(data.event as CR22ArchiveEvent);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load this archive event."
      );
    } finally {
      setEventLoading(false);
    }
  }, []);

  // Load the first event once the index is available.
  useEffect(() => {
    if (indexLoading || !activeKey || activeEvent || eventLoading) return;

    const selected = indexEvents.find((event) => event.key === activeKey);

    if (selected) {
      void selectEvent(selected);
    }
  }, [
    indexLoading,
    activeKey,
    activeEvent,
    eventLoading,
    indexEvents,
    selectEvent,
  ]);

  const activeIndex = visibleEvents.findIndex(
    (event) => event.key === activeKey
  );

  const selectRelativeEvent = (direction: -1 | 1) => {
    if (visibleEvents.length === 0) return;

    const currentIndex = activeIndex >= 0 ? activeIndex : 0;
    const nextIndex = currentIndex + direction;
    const nextEvent = visibleEvents[nextIndex];

    if (nextEvent) void selectEvent(nextEvent);
  };

  const handleFilterChange = (value: CR22ArchiveMediaFilter) => {
    setFilter(value);

    const query = search.trim().toLowerCase();

    const nextVisible = indexEvents.filter((event) => {
      const type = getCR22ArchiveMediaType(event.mediaType);
      const matchesFilter = value === "all" || type === value;
      const matchesSearch =
        !query ||
        event.title.toLowerCase().includes(query) ||
        String(event.start_date.year).includes(query) ||
        String(event.start_date.month ?? "").includes(query);

      return matchesFilter && matchesSearch;
    });

    if (
      nextVisible.length > 0 &&
      !nextVisible.some((event) => event.key === activeKey)
    ) {
      void selectEvent(nextVisible[0]);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);

    const query = value.trim().toLowerCase();

    const nextVisible = indexEvents.filter((event) => {
      const type = getCR22ArchiveMediaType(event.mediaType);
      const matchesFilter = filter === "all" || type === filter;
      const matchesSearch =
        !query ||
        event.title.toLowerCase().includes(query) ||
        String(event.start_date.year).includes(query) ||
        String(event.start_date.month ?? "").includes(query);

      return matchesFilter && matchesSearch;
    });

    if (
      nextVisible.length > 0 &&
      !nextVisible.some((event) => event.key === activeKey)
    ) {
      void selectEvent(nextVisible[0]);
    }
  };

  if (indexLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 bg-neutral-950 text-neutral-300">
        <LoaderCircle size={20} className="animate-spin" />
        <span>Loading the CR22 archive…</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 pb-2 text-white">
      <header className="mx-auto max-w-7xl px-5 pb-6 pt-10 md:px-8 md:pt-16">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
          Congregation Room 22
        </p>

        <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
          The Archive
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-400 md:text-base">
          Explore the people, music, events and moments that make up the CR22
          story.
        </p>

        <div className="mt-6">
          <CR22ArchiveFilters
            search={search}
            onSearchChange={handleSearchChange}
            filter={filter}
            onFilterChange={handleFilterChange}
          />
        </div>

        <p className="mt-4 text-xs text-neutral-500">
          Showing {visibleEvents.length} of {indexEvents.length} events
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="mx-auto mb-5 flex max-w-7xl items-center gap-2 px-5 text-sm text-red-300 md:px-8"
        >
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      <section className="mx-auto max-w-7xl px-5 pb-10 md:px-8">
        {indexEvents.length === 0 ? (
          <div className="rounded-xl border border-white/10 p-8 text-neutral-400">
            No archive events have been added yet.
          </div>
        ) : visibleEvents.length === 0 ? (
          <div className="rounded-xl border border-white/10 p-8 text-neutral-400">
            No events match your search or filter.
          </div>
        ) : eventLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center gap-3 text-neutral-400">
            <LoaderCircle size={20} className="animate-spin" />
            Loading event…
          </div>
        ) : activeEvent ? (
          <CR22ArchiveEventPanel
            event={activeEvent}
            onPrevious={() => selectRelativeEvent(-1)}
            onNext={() => selectRelativeEvent(1)}
            hasPrevious={activeIndex > 0}
            hasNext={
              activeIndex >= 0 && activeIndex < visibleEvents.length - 1
            }
          />
        ) : null}
      </section>

      <div className="sticky bottom-0 z-30">
        <CR22ArchiveDateNav
          events={visibleEvents}
          activeEventKey={activeKey}
          onSelect={(event) => void selectEvent(event)}
        />
      </div>
    </main>
  );
}