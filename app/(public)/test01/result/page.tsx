import { stripe } from "@/lib/stripe1";
import PrintObject from "@/components/PrintObject";

export const dynamic = "force-dynamic";

export default async function ResultPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const sessionId =
    typeof searchParams?.session_id === "string"
      ? searchParams.session_id
      : null;

  if (!sessionId) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">
          No session found
        </h2>
        <p className="text-muted-foreground">
          Missing session_id in URL
        </p>
      </div>
    );
  }

  let session;

  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">
          Invalid session
        </h2>
        <p className="text-red-500">
          {String(err)}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">
        Payment Successful 🎉
      </h2>

      <p>
        Status: <strong>{session.payment_status}</strong>
      </p>

      <p>
        Amount:{" "}
        <strong>
          {session.amount_total
            ? (session.amount_total / 100).toFixed(2)
            : "0.00"}{" "}
          {session.currency?.toUpperCase()}
        </strong>
      </p>

      <PrintObject content={session} />
    </div>
  );
}
