"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function TimelineAdminPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const res = await fetch("/api/admin/timeline");
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteEvent(id: string) {
    if (!confirm("Delete this timeline event?")) return;

    await fetch(`/api/admin/timeline/${id}`, {
      method: "DELETE",
    });

    setEvents((prev) => prev.filter((e) => e._id !== id));
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Timeline Events
        </h1>

        <Link
          href="/admin/timeline/new"
          className="rounded bg-black px-4 py-2 text-white"
        >
          Add Event
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-hidden rounded border">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Year</th>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {events.map((event) => (
                <tr
                  key={event._id}
                  className="border-t"
                >
                  <td className="p-3">
                    {event.startDate?.year}
                  </td>

                  <td className="p-3">
                    {event.title}
                  </td>

                  <td className="p-3">
                    {event.category}
                  </td>

                  <td className="p-3 text-right">
                    <Link
                      href={`/admin/timeline/${event._id}`}
                      className="mr-3 text-blue-600"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() =>
                        deleteEvent(event._id)
                      }
                      className="text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
