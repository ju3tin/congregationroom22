import { stripe } from "@/lib/stripe1";
import PrintObject from "@/components/PrintObject";

export const dynamic = "force-dynamic";

export default async function ResultPage(props: any) {
  const sessionId =
    typeof props?.searchParams?.session_id === "string"
      ? props.searchParams.session_id
      : null;

  if (!sessionId) {
    console.log("DEBUG searchParams:", props?.searchParams);

    return (
      <div className="p-6">
        <h2>No session found</h2>
        <p>Missing session_id in URL</p>
      </div>
    );
  }

  let session;

  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    return (
      <div className="p-6">
        <h2>Stripe Error</h2>
        <pre>{String(err)}</pre>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2>Payment Successful 🎉</h2>
      <p>Status: {session.payment_status}</p>
      <p>
        Amount: {(session.amount_total ?? 0) / 100}{" "}
        {session.currency?.toUpperCase()}
      </p>

      <PrintObject content={session} />
    </div>
  );
}
