import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import DeleteEventButton from "@/components/admin/DeleteEventButton";

import { getEvents } from "@/app/actions/events";

export default async function AdminEventsPage() {
  const events = await getEvents();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>

          <p className="mt-1 text-muted-foreground">
            Manage your events
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/events/new">
            + New Event
          </Link>
        </Button>
      </div>

      {/* Events */}
      <div className="grid gap-6">
        {events.length > 0 ? (
          events.map((event: any) => {
            const eventDate = new Date(event.date);
            const isUpcoming = eventDate > new Date();

            return (
              <Card
                key={event._id}
                className="transition-shadow hover:shadow-md"
              >
                <CardContent className="flex gap-6 p-6">
                  {/* Image */}
                  <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg">
                    {event.image ? (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      {/* Event details */}
                      <div>
                        <h3 className="line-clamp-2 text-xl font-semibold">
                          {event.title}
                        </h3>

                        <p className="mt-1 text-muted-foreground">
                          {event.venue?.name}{" "}
                          •{" "}
                          {event.venue?.city}
                        </p>
                      </div>

                      {/* Status */}
                      <div className="flex flex-col items-end gap-2">
                        <Badge
                          variant={
                            event.status === "published"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {event.status}
                        </Badge>

                        {event.featured && (
                          <Badge
                            variant="outline"
                            className="border-amber-600 text-amber-600"
                          >
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Date / Time */}
                    <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span>📅</span>

                        {eventDate.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>

                      <div className="flex items-center gap-2">
                        <span>⏰</span>

                        {eventDate.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>

                      {isUpcoming && (
                        <Badge variant="outline">
                          Upcoming
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex gap-3">
                      {/* Edit */}
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link
                          href={`/admin/events/${event._id}`}
                        >
                          Edit
                        </Link>
                      </Button>

                      {/* Public event */}
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link
                          href={`/events/${event.slug}`}
                          target="_blank"
                        >
                          View Public
                        </Link>
                      </Button>

                      {/* Delete */}
                      <DeleteEventButton
                        eventId={String(event._id)}
                        eventTitle={event.title}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          /* No events */
          <div className="rounded-xl border py-20 text-center">
            <p className="text-lg text-muted-foreground">
              No events found.
            </p>

            <Button asChild className="mt-4">
              <Link href="/admin/events/new">
                Create Your First Event
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}