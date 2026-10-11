import Link from "next/link";
import TimelineEventForm from "@/components/admin/TimelineEventForm";

export default function NewTimelineEventPage() {
  return (
    <main className="p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <Link
            href="/admin/timeline-events"
            className="text-sm text-gray-500 hover:text-black"
          >
            ← Timeline Events
          </Link>

          <h1 className="mt-3 text-3xl font-bold">
            New Timeline Event
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create a new TimelineJS event.
          </p>
        </div>

        <TimelineEventForm mode="new" />
      </div>
    </main>
  );
}