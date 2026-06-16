import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-07-30.basil",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  console.log("🔥 WEBHOOK HIT");

  if (!signature) {
    console.log("❌ Missing stripe-signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    console.log("✅ Webhook verified");
    console.log("📦 Event type:", event.type);
    console.log("🆔 Event ID:", event.id);
  } catch (err: any) {
    console.log("❌ Webhook signature failed:", err.message);

    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  // =========================
  // CHECKOUT SUCCESS EVENT
  // =========================
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    console.log("🎉 PAYMENT SUCCESS");
    console.log("📧 Email:", session.customer_details?.email);
    console.log("💰 Amount:", session.amount_total);
    console.log("🧾 Session ID:", session.id);

    // 👉 You will later:
    // - save order to DB
    // - generate ticket
    // - send email

    console.log("📦 FULL SESSION:");
    console.log(JSON.stringify(session, null, 2));
  }

  // =========================
  // OTHER EVENTS (optional debug)
  // =========================
  else {
    console.log("ℹ️ Unhandled event type:", event.type);
  }

  return NextResponse.json({ received: true });
}
