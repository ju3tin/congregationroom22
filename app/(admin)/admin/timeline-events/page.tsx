"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface TimelineEvent {
  _id: string;
  id: string;
  title: string;
  text?: string;
  group?: string;

  start_date: {
    year: number;
    month?: number;
    day?: number;
    hour?: number;
    minute?: number;
    second?: number;
  };

  media?: {
    type: "image" | "youtube" | "instagram" | "tiktok";
    url: string;
    caption?: string;
    credit?: string;
  };

  createdAt: string;
  updatedAt: string;
}

export default function TimelineEventsPage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadEvents() {
    try {
      setLoading(true);

      const response = await fetch("/api/timeline-events", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load timeline events"
        );
      }

      setEvents(data.events || []);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load timeline events"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function deleteEvent(event: TimelineEvent) {
    const confirmed = window.confirm(
      `Delete "${event.title}"?\n\nThis cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/timeline-events/${event.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete event"
        );
      }

      setEvents((current) =>
        current.filter((item) => item.id !== event.id)
      );
    } catch (err) {
      console.error(err);

      alert(
        err instanceof Error
          ? err.message
          : "Failed to delete event"
      );
    }
  }

  function formatDate(event: TimelineEvent) {
    const date = event.start_date;

    const parts = [
      date.year,
      date.month,
      date.day,
    ].filter(Boolean);

    let result = parts.join("-");

    if (date.hour !== undefined) {
      result += ` ${String(date.hour).padStart(2, "0")}`;

      if (date.minute !== undefined) {
        result += `:${String(date.minute).padStart(2, "0")}`;
      }

      if (date.second !== undefined) {
        result += `:${String(date.second).padStart(2, "0")}`;
      }
    }

    return result;
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">
          Loading timeline events...
        </p>
      </div>
    );
  }

  return (
    <main className="p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Timeline Events
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your TimelineJS events.
            </p>
          </div>

          <Link
            href="/admin/timeline-events/new"
            className="rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
          >
            + New Event
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {events.length === 0 ? (
          <div className="rounded-xl border  p-12 text-center shadow-sm">
            <h2 className="text-lg font-semibold">
              No timeline events
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Create your first TimelineJS event.
            </p>

            <Link
              href="/admin/timeline-events/new"
              className="mt-5 inline-block rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white"
            >
              Create Event
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border  shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="px-5 py-4 font-semibold">
                      Date
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Title
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      ID
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Media
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Group
                    </th>

                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {events.map((event) => (
                    <tr
                      key={event._id}
                      className="hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                        {formatDate(event)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold">
                          {event.title}
                        </div>

                        {event.text && (
                          <div className="mt-1 max-w-md truncate text-xs text-gray-500">
                            {event.text.replace(
                              /<[^>]*>/g,
                              ""
                            )}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <code className="rounded bg-gray-100 px-2 py-1 text-xs">
                          {event.id}
                        </code>
                      </td>

                      <td className="px-5 py-4">
                        {event.media ? (
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize">
                            {event.media.type}
                          </span>
                        ) : (
                          <span className="text-gray-400">
                            —
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {event.group || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/timeline-events/${event.id}/edit`}
                            className="rounded-lg border px-3 py-2 text-xs font-medium hover:bg-gray-100"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() => deleteEvent(event)}
                            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}