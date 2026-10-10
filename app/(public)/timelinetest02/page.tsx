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
            "/api/timeline-events",
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
       

        <div className="rounded-lg bg-red-50 p-5 text-red-700">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
          <TimelineJS
            events={events}
            height="750px"
          />
       

    </main>
  );
}