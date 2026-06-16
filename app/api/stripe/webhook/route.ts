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
  console.log("🔥 WEBHOOK START");

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
    console.log("❌ INVALID SIGNATURE");
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  console.log("📦 EVENT:", event.type);

  if (event.type !== "checkout.session.completed") {
    console.log("⏭ Ignored event");
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  try {
    await dbConnect();

    const orderId = session.metadata?.orderId;

    if (!orderId) {
      throw new Error("Missing orderId in metadata");
    }

    console.log("🧾 Order:", orderId);

    // 1. update order
    await Order.findByIdAndUpdate(orderId, {
      status: "paid",
      paypalCaptureId: session.payment_intent,
    });

    console.log("✅ Order updated");

    // 2. create tickets
    const tickets = await createTicketsFromOrder(orderId);

    console.log("🎟 Tickets:", tickets.length);

    // 3. send emails
    const email = session.customer_details?.email;

    if (email) {
      for (const t of tickets) {
        await sendTicketEmail({
          email,
          ticketCode: t.ticket.ticketCode,
          qrCode: t.qrCode,
        });
      }

      console.log("📧 Emails sent");
    }

    console.log("✅ WEBHOOK DONE");
  } catch (err: any) {
    console.log("❌ WEBHOOK ERROR:", err.message);
  }

  return NextResponse.json({ received: true });
}
