
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InstagramImportPage() {
  const router = useRouter();

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creator, setCreator] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("Instagram");
  const [embedHtml, setEmbedHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function previewPost() {
    setLoading(true);
    setMessage("");
    setEmbedHtml("");

    try {
      const response = await fetch("/api/timeline/import/instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to load Instagram post.");
      }

      setUrl(result.postUrl);
      setEmbedHtml(result.embedHtml);
      setMessage("Embed loaded. Complete the timeline details below.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Preview failed."
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
  
    try {
      const cleanUrl = url.trim();
      const cleanTitle = title.trim();
      const cleanDescription = description.trim();
  
      if (!cleanUrl) {
        throw new Error("Preview an Instagram post first.");
      }
  
      if (!cleanTitle) {
        throw new Error("Enter a timeline title.");
      }
  
      // The save API requires a description.
      // Use the title as a fallback if the caption is empty.
      const finalDescription = cleanDescription || cleanTitle;
  
      if (!date) {
        throw new Error("Enter the original publication date.");
      }
  
      const parsedDate = new Date(`${date}T12:00:00Z`);
  
      if (
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== date
      ) {
        throw new Error("Enter a valid publication date.");
      }
  
      const response = await fetch("/api/timeline/import/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: cleanTitle,
          description: finalDescription,
          url: cleanUrl,
          embedUrl: cleanUrl,
          publishedAt: parsedDate.toISOString(),
          category: category.trim() || "Instagram",
          creator: creator.trim() || "Instagram",
          tags: ["instagram", "post"],
          featured: false,
          sortOrder: 0,
        }),
      });
  
      const result = await response.json();
  
      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Failed to save timeline event."
        );
      }
  
      if (result.duplicate) {
        setMessage("This Instagram post has already been imported.");
        return;
      }
  
      setMessage("Instagram event saved to your timeline.");
      router.push("/admin/timeline");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Save failed."
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900";

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-3xl font-bold">
        Import Public Instagram Post
      </h1>

      <p className="text-gray-600">
        Paste a public post or Reel URL. Preview the original post,
        then enter the historical details for TimelineJS.
      </p>

      <section className="space-y-3 rounded-lg border p-5">
        <label className="block text-sm font-medium">
          Instagram post URL
        </label>

        <input
          className={inputClass}
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://www.instagram.com/p/..."
        />

        <button
          type="button"
          onClick={previewPost}
          disabled={loading || !url.trim()}
          className="rounded-md bg-black px-5 py-3 text-white disabled:opacity-50"
        >
          {loading ? "Loading..." : "Preview Instagram post"}
        </button>
      </section>

      {embedHtml && (
        <section className="rounded-lg border p-5">
          <h2 className="mb-3 font-semibold">Original post</h2>
          <p className="text-sm text-gray-600">
            The embed is provided for display. Metadata below is entered
            separately.
          </p>

          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-blue-600 underline"
          >
            Open original Instagram post
          </a>
        </section>
      )}

      <form onSubmit={saveEvent} className="space-y-4 rounded-lg border p-5">
        <h2 className="text-xl font-semibold">Timeline event details</h2>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Timeline title
          </label>
          <input
            className={inputClass}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Description / caption
          </label>
          <textarea
            className={inputClass}
            rows={5}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Creator / attribution
          </label>
          <input
            className={inputClass}
            value={creator}
            onChange={(event) => setCreator(event.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Original publication date
          </label>
          <input
            className={inputClass}
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Category
          </label>
          <input
            className={inputClass}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={saving || !url || !title.trim()}
          className="rounded-md bg-green-700 px-5 py-3 text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save to TimelineJS"}
        </button>
      </form>

      {message && (
        <p className="rounded-md border p-3 text-sm">{message}</p>
      )}
    </main>
  );
}
