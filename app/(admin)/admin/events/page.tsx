import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getEvents } from "@/app/actions/events"; // Adjust path if needed

export default async function AdminEventsPage() {
  const events = await getEvents(); // Make sure this function exists in your actions

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground mt-1">Manage your events</p>
        </div>
        <Button asChild>
          <Link href="/admin/events/new">+ New Event</Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {events.length > 0 ? (
          events.map((event: any) => {
            const eventDate = new Date(event.date);
            const isUpcoming = eventDate > new Date();

            return (
              <Card key={event._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex gap-6">
                  {/* Image */}
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold line-clamp-2">{event.title}</h3>
                        <p className="text-muted-foreground mt-1">
                          {event.venue?.name} • {event.venue?.city}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={event.status === "published" ? "default" : "secondary"}>
                          {event.status}
                        </Badge>
                        {event.featured && (
                          <Badge variant="outline" className="text-amber-600 border-amber-600">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>

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
                        {eventDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/events/${event._id}`}>Edit</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/events/${event.slug}`} target="_blank">
                          View Public
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-20 border rounded-xl">
            <p className="text-muted-foreground text-lg">No events found.</p>
            <Button asChild className="mt-4">
              <Link href="/admin/events/new">Create Your First Event</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
