"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type TimelineMediaType =
  | "image"
  | "youtube"
  | "instagram"
  | "tiktok";

interface TimelineDate {
  year: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
}

interface TimelineMedia {
  type: TimelineMediaType;
  url: string;
  caption?: string;
  credit?: string;
}

interface TimelineBackground {
  color?: string;
  url?: string;
}

export interface TimelineEventFormData {
  id: string;
  start_date: TimelineDate;
  end_date?: TimelineDate;
  title: string;
  text: string;
  group?: string;
  background?: TimelineBackground;
  media?: TimelineMedia;
}

interface TimelineEventFormProps {
  mode: "new" | "edit";
  initialData?: TimelineEventFormData;
}

export default function TimelineEventForm({
  mode,
  initialData,
}: TimelineEventFormProps) {
  const router = useRouter();

  const [id, setId] = useState(initialData?.id || "");

  const [title, setTitle] = useState(initialData?.title || "");
  const [text, setText] = useState(initialData?.text || "");
  const [group, setGroup] = useState(initialData?.group || "");

  const [startYear, setStartYear] = useState(
    String(initialData?.start_date.year || "")
  );
  const [startMonth, setStartMonth] = useState(
    String(initialData?.start_date.month || "")
  );
  const [startDay, setStartDay] = useState(
    String(initialData?.start_date.day || "")
  );
  const [startHour, setStartHour] = useState(
    String(initialData?.start_date.hour || "")
  );
  const [startMinute, setStartMinute] = useState(
    String(initialData?.start_date.minute || "")
  );
  const [startSecond, setStartSecond] = useState(
    String(initialData?.start_date.second || "")
  );

  const [hasEndDate, setHasEndDate] = useState(
    Boolean(initialData?.end_date)
  );

  const [endYear, setEndYear] = useState(
    String(initialData?.end_date?.year || "")
  );
  const [endMonth, setEndMonth] = useState(
    String(initialData?.end_date?.month || "")
  );
  const [endDay, setEndDay] = useState(
    String(initialData?.end_date?.day || "")
  );
  const [endHour, setEndHour] = useState(
    String(initialData?.end_date?.hour || "")
  );
  const [endMinute, setEndMinute] = useState(
    String(initialData?.end_date?.minute || "")
  );
  const [endSecond, setEndSecond] = useState(
    String(initialData?.end_date?.second || "")
  );

  const [hasMedia, setHasMedia] = useState(
    Boolean(initialData?.media)
  );

  const [mediaType, setMediaType] = useState<TimelineMediaType>(
    initialData?.media?.type || "image"
  );

  const [mediaUrl, setMediaUrl] = useState(
    initialData?.media?.url || ""
  );

  const [mediaCaption, setMediaCaption] = useState(
    initialData?.media?.caption || ""
  );

  const [mediaCredit, setMediaCredit] = useState(
    initialData?.media?.credit || ""
  );

  const [hasBackground, setHasBackground] = useState(
    Boolean(initialData?.background)
  );

  const [backgroundColor, setBackgroundColor] = useState(
    initialData?.background?.color || ""
  );

  const [backgroundUrl, setBackgroundUrl] = useState(
    initialData?.background?.url || ""
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function numberValue(value: string) {
    if (!value) return undefined;
    return Number(value);
  }

  function buildDate(
    year: string,
    month: string,
    day: string,
    hour: string,
    minute: string,
    second: string
  ): TimelineDate {
    return {
      year: Number(year),
      ...(month && { month: Number(month) }),
      ...(day && { day: Number(day) }),
      ...(hour && { hour: Number(hour) }),
      ...(minute && { minute: Number(minute) }),
      ...(second && { second: Number(second) }),
    };
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    if (!id.trim()) {
      setError("Event ID is required.");
      return;
    }

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!startYear) {
      setError("Start year is required.");
      return;
    }

    if (hasMedia && !mediaUrl.trim()) {
      setError("Media URL is required when media is enabled.");
      return;
    }

    try {
      setSaving(true);

      const payload: TimelineEventFormData = {
        id: id.trim(),

        start_date: buildDate(
          startYear,
          startMonth,
          startDay,
          startHour,
          startMinute,
          startSecond
        ),

        title: title.trim(),
        text,

        ...(group.trim() && {
          group: group.trim(),
        }),

        ...(hasEndDate &&
          endYear && {
            end_date: buildDate(
              endYear,
              endMonth,
              endDay,
              endHour,
              endMinute,
              endSecond
            ),
          }),

        ...(hasMedia && {
          media: {
            type: mediaType,
            url: mediaUrl.trim(),
            ...(mediaCaption.trim() && {
              caption: mediaCaption.trim(),
            }),
            ...(mediaCredit.trim() && {
              credit: mediaCredit.trim(),
            }),
          },
        }),

        ...(hasBackground && {
          background: {
            ...(backgroundColor.trim() && {
              color: backgroundColor.trim(),
            }),
            ...(backgroundUrl.trim() && {
              url: backgroundUrl.trim(),
            }),
          },
        }),
      };

      const response = await fetch(
        mode === "new"
          ? "/api/timeline-events"
          : `/api/timeline-events/${initialData?.id}`,
        {
          method: mode === "new" ? "POST" : "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to save timeline event"
        );
      }

      router.push("/admin/timeline-events");
      router.refresh();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save timeline event"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* BASIC */}
      <section className="rounded-xl border  p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold">
          Event
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              ID
            </label>

            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              disabled={mode === "edit"}
              placeholder="youtube-test"
              className="w-full rounded-lg border px-3 py-2.5 disabled:bg-gray-100"
            />

            <p className="mt-1 text-xs text-gray-500">
              Unique TimelineJS event ID
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Title
            </label>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="YouTube Test"
              className="w-full rounded-lg border px-3 py-2.5"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Group
            </label>

            <input
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              placeholder="Music"
              className="w-full rounded-lg border px-3 py-2.5"
            />
          </div>
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium">
            Text / HTML
          </label>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder="<p>This is the event description.</p>"
            className="w-full rounded-lg border px-3 py-2.5 font-mono text-sm"
          />
        </div>
      </section>

      {/* START DATE */}
      <section className="rounded-xl border  p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">
          Start date
        </h2>

        <p className="mb-5 text-sm text-gray-500">
          TimelineJS requires a year. The other fields are optional.
        </p>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
          <DateInput
            label="Year *"
            value={startYear}
            onChange={setStartYear}
            placeholder="2024"
          />

          <DateInput
            label="Month"
            value={startMonth}
            onChange={setStartMonth}
            placeholder="2"
          />

          <DateInput
            label="Day"
            value={startDay}
            onChange={setStartDay}
            placeholder="10"
          />

          <DateInput
            label="Hour"
            value={startHour}
            onChange={setStartHour}
            placeholder="20"
          />

          <DateInput
            label="Minute"
            value={startMinute}
            onChange={setStartMinute}
            placeholder="30"
          />

          <DateInput
            label="Second"
            value={startSecond}
            onChange={setStartSecond}
            placeholder="00"
          />
        </div>
      </section>

      {/* END DATE */}
      <section className="rounded-xl border  p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              End date
            </h2>

            <p className="text-sm text-gray-500">
              Optional. Useful for events with a duration.
            </p>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hasEndDate}
              onChange={(e) => setHasEndDate(e.target.checked)}
              className="h-4 w-4"
            />
            Enable end date
          </label>
        </div>

        {hasEndDate && (
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-6">
            <DateInput
              label="Year *"
              value={endYear}
              onChange={setEndYear}
              placeholder="2024"
            />

            <DateInput
              label="Month"
              value={endMonth}
              onChange={setEndMonth}
              placeholder="2"
            />

            <DateInput
              label="Day"
              value={endDay}
              onChange={setEndDay}
              placeholder="11"
            />

            <DateInput
              label="Hour"
              value={endHour}
              onChange={setEndHour}
              placeholder="22"
            />

            <DateInput
              label="Minute"
              value={endMinute}
              onChange={setEndMinute}
              placeholder="00"
            />

            <DateInput
              label="Second"
              value={endSecond}
              onChange={setEndSecond}
              placeholder="00"
            />
          </div>
        )}
      </section>

      {/* MEDIA */}
      <section className="rounded-xl border  p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              Media
            </h2>

            <p className="text-sm text-gray-500">
              Image, YouTube, Instagram or TikTok.
            </p>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hasMedia}
              onChange={(e) => setHasMedia(e.target.checked)}
              className="h-4 w-4"
            />
            Enable media
          </label>
        </div>

        {hasMedia && (
          <div className="mt-5 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Media type
                </label>

                <select
                  value={mediaType}
                  onChange={(e) =>
                    setMediaType(
                      e.target.value as TimelineMediaType
                    )
                  }
                  className="w-full rounded-lg border px-3 py-2.5"
                >
                  <option value="image">Image</option>
                  <option value="youtube">YouTube</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  URL
                </label>

                <input
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder={
                    mediaType === "image"
                      ? "/images/test.jpg"
                      : "https://www.youtube.com/watch?v=..."
                  }
                  className="w-full rounded-lg border px-3 py-2.5"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Caption
                </label>

                <input
                  value={mediaCaption}
                  onChange={(e) =>
                    setMediaCaption(e.target.value)
                  }
                  placeholder="Video caption"
                  className="w-full rounded-lg border px-3 py-2.5"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Credit
                </label>

                <input
                  value={mediaCredit}
                  onChange={(e) =>
                    setMediaCredit(e.target.value)
                  }
                  placeholder="YouTube"
                  className="w-full rounded-lg border px-3 py-2.5"
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* BACKGROUND */}
      <section className="rounded-xl border  p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              Background
            </h2>

            <p className="text-sm text-gray-500">
              Optional TimelineJS slide background.
            </p>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hasBackground}
              onChange={(e) =>
                setHasBackground(e.target.checked)
              }
              className="h-4 w-4"
            />
            Enable background
          </label>
        </div>

        {hasBackground && (
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Background colour
              </label>

              <input
                value={backgroundColor}
                onChange={(e) =>
                  setBackgroundColor(e.target.value)
                }
                placeholder="#000000"
                className="w-full rounded-lg border px-3 py-2.5"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Background image URL
              </label>

              <input
                value={backgroundUrl}
                onChange={(e) =>
                  setBackgroundUrl(e.target.value)
                }
                placeholder="/images/background.jpg"
                className="w-full rounded-lg border px-3 py-2.5"
              />
            </div>
          </div>
        )}
      </section>

      {/* ACTIONS */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/timeline-events")}
          className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-black px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : mode === "new"
            ? "Create Event"
            : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

function DateInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-gray-600">
        {label}
      </label>

      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border px-3 py-2.5"
      />
    </div>
  );
}