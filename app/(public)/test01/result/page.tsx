import { stripe } from "@/lib/stripe1";
import PrintObject from "@/components/PrintObject";

export const dynamic = "force-dynamic";

export default async function ResultPage({
  searchParams,
}: {
  searchParams?: { session_id?: string };
}) {
  const sessionId = searchParams?.session_id;

  // =========================
  // No session provided
  // =========================
  if (!sessionId) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">
          No session found
        </h2>
        <p className="text-muted-foreground">
          Please complete your payment first.
        </p>
      </div>
    );
  }

  // =========================
  // Fetch Stripe session
  // =========================
  let session;

  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">
          Invalid session
        </h2>
        <p className="text-red-500">
          {String(error)}
        </p>
      </div>
    );
  }

  // =========================
  // Success UI
  // =========================
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">
        Payment Complete 🎉
      </h2>

      <p>
        Status:{" "}
        <span className="font-semibold">
          {session.payment_status}
        </span>
      </p>

      <p>
        Amount:{" "}
        <span className="font-semibold">
          {session.amount_total
            ? (session.amount_total / 100).toFixed(2)
            : "0.00"}{" "}
          {session.currency?.toUpperCase()}
        </span>
      </p>

      <h3 className="text-lg font-semibold mt-4">
        Session Details
      </h3>

      <PrintObject content={session} />
    </div>
  );
}
