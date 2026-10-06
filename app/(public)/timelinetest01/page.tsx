"use client";

import { useEffect, useState } from "react";

import TimelineJS, {
  TimelineEvent,
} from "@/components/TimelineJS";

export default function TimelineTestPage() {
  const [events, setEvents] =
    useState<TimelineEvent[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadTimeline() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            "/api/timeline-test",
            {
              cache: "no-store",
            }
          );

        if (!response.ok) {
          throw new Error(
            "Failed to load timeline API"
          );
        }

        const data =
          await response.json();

        setEvents(
          data.events || []
        );
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load timeline"
        );
      } finally {
        setLoading(false);
      }
    }

    loadTimeline();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-lg">
          Loading TimelineJS...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen p-10">
        <h1 className="mb-4 text-3xl font-bold">
          TimelineJS Test
        </h1>

        <div className="rounded-lg bg-red-50 p-5 text-red-700">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            TimelineJS Test
          </h1>

          <p className="mt-2 text-gray-600">
            Testing images, YouTube,
            Instagram and TikTok.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border bg-white shadow">
          <TimelineJS
            events={events}
            height="750px"
          />
        </div>

        <div className="mt-8 rounded-xl border bg-gray-50 p-6">
          <h2 className="mb-2 text-lg font-semibold">
            API
          </h2>

          <a
            href="/api/timeline-test"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            /api/timeline-test
          </a>

          <h2 className="mb-2 mt-6 text-lg font-semibold">
            Events loaded
          </h2>

          <p className="text-gray-600">
            {events.length} events
          </p>

          <div className="mt-4 space-y-2">
            {events.map((event) => (
              <div
                key={event.id}
                className="rounded border bg-white p-3"
              >
                <strong>
                  {event.title}
                </strong>

                {event.media && (
                  <span className="ml-2 text-sm text-gray-500">
                    {event.media.type}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}