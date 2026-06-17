"use client";

import { useState } from "react";

export default function TestEmailPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const sendEmail = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await res.json();

      console.log(data);

      alert("Email sent");
    } catch (err) {
      console.error(err);
      alert("Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-8 space-y-4">
      <h1 className="text-2xl font-bold">
        Test Ticket Email
      </h1>

      <input
        className="border p-2 w-full"
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button
        onClick={sendEmail}
        disabled={loading}
        className="px-4 py-2 bg-black text-white rounded"
      >
        {loading ? "Sending..." : "Send Test Email"}
      </button>
    </div>
  );
}
