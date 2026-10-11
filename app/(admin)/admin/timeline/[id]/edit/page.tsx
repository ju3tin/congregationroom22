import Link from "next/link";
import { notFound } from "next/navigation";
import TimelineEventForm, {
  TimelineEventFormData,
} from "@/components/admin/TimelineEventForm";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditTimelineEventPage({
  params,
}: PageProps) {
  const { id } = await params;

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const response = await fetch(
    `${baseUrl}/api/timeline-events/${id}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    notFound();
  }

  const data = await response.json();

  if (!data.success || !data.event) {
    notFound();
  }

  const event: TimelineEventFormData = {
    id: data.event.id,

    title: data.event.title,

    text: data.event.text || "",

    group: data.event.group,

    start_date: {
      year: data.event.start_date.year,
      month: data.event.start_date.month,
      day: data.event.start_date.day,
      hour: data.event.start_date.hour,
      minute: data.event.start_date.minute,
      second: data.event.start_date.second,
    },

    end_date: data.event.end_date
      ? {
          year: data.event.end_date.year,
          month: data.event.end_date.month,
          day: data.event.end_date.day,
          hour: data.event.end_date.hour,
          minute: data.event.end_date.minute,
          second: data.event.end_date.second,
        }
      : undefined,

    media: data.event.media
      ? {
          type: data.event.media.type,
          url: data.event.media.url,
          caption: data.event.media.caption,
          credit: data.event.media.credit,
        }
      : undefined,

    background: data.event.background
      ? {
          color: data.event.background.color,
          url: data.event.background.url,
        }
      : undefined,
  };

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
            Edit Timeline Event
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Editing: {event.title}
          </p>
        </div>

        <TimelineEventForm
          mode="edit"
          initialData={event}
        />
      </div>
    </main>
  );
}