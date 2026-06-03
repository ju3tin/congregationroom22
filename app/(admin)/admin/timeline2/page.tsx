"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface TimelineEvent {
  _id: string;
  title: string;
  category?: string;
  featured?: boolean;
  startDate: {
    year: number;
    month?: number;
    day?: number;
  };
}

export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const res = await fetch("/api/timeline");
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      console.error("Failed to load timeline events:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this timeline event?"
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/timeline/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      setEvents((prev) => prev.filter((event) => event._id !== id));
    } catch (error) {
      console.error(error);
      alert("Failed to delete event.");
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Timeline Events</h1>
          <p className="text-muted-foreground">
            Manage timeline entries displayed on the site.
          </p>
        </div>

        <Link
          href="/admin/timeline/new"
          className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
        >
          Add Event
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Featured</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center">
                  Loading...
                </td>
              </tr>
            ) : events.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center">
                  No timeline events found.
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event._id} className="border-b">
                  <td className="px-4 py-3">
                    {event.startDate.year}
                  </td>

                  <td className="px-4 py-3 font-medium">
                    {event.title}
                  </td>

                  <td className="px-4 py-3">
                    {event.category || "-"}
                  </td>

                  <td className="px-4 py-3">
                    {event.featured ? "✓" : "-"}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/timeline/${event._id}`}
                        className="rounded border px-3 py-1"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => handleDelete(event._id)}
                        className="rounded border border-red-500 px-3 py-1 text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
