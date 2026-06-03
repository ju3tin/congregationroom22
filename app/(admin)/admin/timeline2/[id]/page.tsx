"use client";

import {
  useParams,
  useRouter,
} from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

export default function EditTimelinePage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<any>({
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

  useEffect(() => {
    fetchEvent();
  }, []);

  async function fetchEvent() {
    const res = await fetch(
      `/api/admin/timeline/${id}`
    );

    const data = await res.json();

    setForm(data);
    setLoading(false);
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    await fetch(
      `/api/admin/timeline/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(form),
      }
    );

    router.push("/admin/timeline");
  }

  if (loading) {
    return <p className="p-6">Loading...</p>;
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Edit Timeline Event
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <input
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
          className="w-full rounded border p-2"
          value={form.category}
          onChange={(e) =>
            setForm({
              ...form,
              category: e.target.value,
            })
          }
        />

        <button
          type="submit"
          className="rounded bg-black px-4 py-2 text-white"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
