import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-07-30.basil",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (err: any) {
    console.error("Webhook signature error:", err.message);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // =========================
  // PAYMENT SUCCESS
  // =========================
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    console.log("Payment successful:", session.id);

    const email = session.customer_details?.email;
    const amount = session.amount_total;

    // 👉 HERE YOU WILL:
    // 1. Save order to DB
    // 2. Generate ticket
    // 3. Send email

    console.log({
      email,
      amount,
      sessionId: session.id,
    });
  }

  return NextResponse.json({ received: true });
}
