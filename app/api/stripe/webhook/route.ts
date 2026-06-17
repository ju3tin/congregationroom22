import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { createTicketsFromOrder } from "@/services/ticketService";
import { sendTicketEmail } from "@/lib/mailer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: NextRequest) {
  console.log("🔥 STRIPE WEBHOOK START");

  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.log("❌ INVALID SIGNATURE:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("📦 EVENT TYPE:", event.type);

  if (event.type !== "checkout.session.completed") {
    console.log("⏭ Ignored event");
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  const metadata = session.metadata;

  console.log("📊 METADATA:", metadata);

  try {
    await dbConnect();

    if (!metadata?.orderId) {
      console.log("❌ Missing orderId in metadata");
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const orderId = metadata.orderId;

    console.log("🧾 Processing order:", orderId);

    // 1. Update order safely
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        status: "paid",
        stripeSessionId: session.id,
      },
      { new: true }
    );

    if (!order) {
      throw new Error("Order not found");
    }

    console.log("✅ Order marked as paid");

    // 2. Create tickets
    const tickets = await createTicketsFromOrder(orderId);

    console.log("🎟 Tickets created:", tickets.length);

    // 3. Send email
    const email = session.customer_details?.email;

    if (email && tickets.length > 0) {
      await sendTicketEmail({
        email,
        tickets,
      });

      console.log("📧 Email sent");
    }

    console.log("✅ WEBHOOK COMPLETE");

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.log("❌ WEBHOOK ERROR:", err.message);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
