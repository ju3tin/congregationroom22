"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewTimelinePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    startDate: {
      year: "",
      month: "",
      day: "",
    },
    media: {
      url: "",
      caption: "",
      credit: "",
    },
  });

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    await fetch("/api/admin/timeline", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    router.push("/admin/timeline");
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-3xl font-bold">
        New Timeline Event
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <input
          placeholder="Title"
          className="w-full rounded border p-2"
          value={form.title}
          onChange={(e) =>
            setForm({
              ...form,
              title: e.target.value,
            })
          }
        />

        <textarea
          placeholder="Description"
          rows={6}
          className="w-full rounded border p-2"
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value,
            })
          }
        />

        <input
          placeholder="Category"
          className="w-full rounded border p-2"
          value={form.category}
          onChange={(e) =>
            setForm({
              ...form,
              category: e.target.value,
            })
          }
        />

        <div className="grid grid-cols-3 gap-4">
          <input
            placeholder="Year"
            className="rounded border p-2"
            value={form.startDate.year}
            onChange={(e) =>
              setForm({
                ...form,
                startDate: {
                  ...form.startDate,
                  year: e.target.value,
                },
              })
            }
          />

          <input
            placeholder="Month"
            className="rounded border p-2"
            value={form.startDate.month}
            onChange={(e) =>
              setForm({
                ...form,
                startDate: {
                  ...form.startDate,
                  month: e.target.value,
                },
              })
            }
          />

          <input
            placeholder="Day"
            className="rounded border p-2"
            value={form.startDate.day}
            onChange={(e) =>
              setForm({
                ...form,
                startDate: {
                  ...form.startDate,
                  day: e.target.value,
                },
              })
            }
          />
        </div>

        <input
          placeholder="Image URL"
          className="w-full rounded border p-2"
          value={form.media.url}
          onChange={(e) =>
            setForm({
              ...form,
              media: {
                ...form.media,
                url: e.target.value,
              },
            })
          }
        />

        <button
          type="submit"
          className="rounded bg-black px-4 py-2 text-white"
        >
          Create Event
        </button>
      </form>
    </div>
  );
}
