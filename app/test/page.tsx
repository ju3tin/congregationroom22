"use client";

import { useState } from "react";

export default function TestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);

    const payload = {
      email: form.get("email"),
      eventTitle: form.get("eventTitle"),
      venue: form.get("venue"),
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
      <h1>🧪 Order → Ticket → Email Test</h1>

      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <input name="email" placeholder="Email" required />
        <input name="eventTitle" placeholder="Event Title" />
        <input name="venue" placeholder="Venue" />

        <button disabled={loading}>
          {loading ? "Creating..." : "Create Order & Ticket"}
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
