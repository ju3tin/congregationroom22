"use client";

import { useState } from "react";

export default function TestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);

    const payload = {
      email: form.get("email"),
      eventId: form.get("eventId"),
      eventTitle: form.get("eventTitle"),
      venue: form.get("venue"),
      userId: "test-user-123",
    };

    const res = await fetch("/api/test/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    setResult(data);
    setLoading(false);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>🧪 Ticket Test Form</h1>

      <form onSubmit={submit} style={{ display: "grid", gap: 10, maxWidth: 400 }}>
        <input name="email" placeholder="Email" />
        <input name="eventId" placeholder="Event ID" />
        <input name="eventTitle" placeholder="Event Title" />
        <input name="venue" placeholder="Venue" />

        <button disabled={loading}>
          {loading ? "Creating..." : "Create Ticket"}
        </button>
      </form>

      {result && (
        <pre style={{ marginTop: 20 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
