import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTimelineEvents } from "@/app/actions"; // adjust path

export default async function TimelinePage() {
  const events = await getTimelineEvents();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Timeline Events</h1>
        <Button asChild>
          <Link href="/admin/timeline/new">+ New Event</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {events.map((event: any) => (
          <div key={event.id} className="border rounded-lg p-6 flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-xl">{event.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {event.startDate.year}
                {event.endDate && ` — ${event.endDate.year}`}
                {event.category && ` • ${event.category}`}
              </p>
              <p className="mt-2 line-clamp-2">{event.description}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/timeline/${event.id}`}>Edit</Link>
              </Button>
              {/* Delete button can be added with client component */}
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No timeline events yet.</p>
        )}
      </div>
    </div>
  );
}
