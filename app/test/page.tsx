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

      // 🧠 IMPORTANT: we now use REAL ObjectIds for testing
      eventId: crypto.randomUUID().replace(/-/g, "").slice(0, 24),
      userId: crypto.randomUUID().replace(/-/g, "").slice(0, 24),
      orderId: crypto.randomUUID().replace(/-/g, "").slice(0, 24),
      tierId: crypto.randomUUID().replace(/-/g, "").slice(0, 24),

      eventTitle: form.get("eventTitle") || "Test Event",
      venue: form.get("venue") || "Test Venue",
    };

    try {
      const res = await fetch("/api/test/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      setResult(data);
    } catch (err: any) {
      setResult({ error: err.message });
    }

    setLoading(false);
  }

  return (
    <div style={{ padding: 20, maxWidth: 500 }}>
      <h1>🧪 Ticket System Test</h1>

      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <input name="email" placeholder="Email" required />
        <input name="eventTitle" placeholder="Event Title" />
        <input name="venue" placeholder="Venue" />

        <button disabled={loading}>
          {loading ? "Creating..." : "Create Ticket"}
        </button>
      </form>

      {result && (
        <pre
          style={{
            marginTop: 20,
            background: "#111",
            color: "#0f0",
            padding: 10,
            overflow: "auto",
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
