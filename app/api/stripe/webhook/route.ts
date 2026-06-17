import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Ticket from "@/models/Ticket";
import { v4 as uuidv4 } from "uuid";
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

  console.log("📦 EVENT:", event.type);

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const m = session.metadata || {};

  try {
    await dbConnect();

    console.log("📊 METADATA:", m);

    // -------------------------
    // 1. CREATE ORDER (AUTO)
    // -------------------------
    const order = await Order.create({
      orderNumber: session.id,
      userId: m.userId || "guest",
      type: "ticket",

      items: [
        {
          itemType: "ticket",
          eventId: m.eventId,
          tierId: m.tierId,
          quantity: Number(m.ticketCount || 1),
          unitPrice: (session.amount_total || 0) / 100,
          name: m.tierName || "General Admission",
        },
      ],

      subtotal: (session.amount_total || 0) / 100,
      total: (session.amount_total || 0) / 100,

      paypalOrderId: session.id,
      status: "paid",
    });

    console.log("🧾 ORDER CREATED:", order._id);

    // -------------------------
    // 2. CREATE TICKETS
    // -------------------------
    const tickets = [];

    const count = Number(m.ticketCount || 1);

    for (let i = 0; i < count; i++) {
      const ticket = await Ticket.create({
        ticketCode: uuidv4(),
        orderId: order._id,
        eventId: m.eventId,
        tierId: m.tierId,
        userId: m.userId || "guest",
        tierName: m.tierName,
        eventTitle: m.eventTitle,
        eventDate: m.eventDate,
        venue: typeof m.venue === "string"
          ? m.venue
          : "TBA",
        status: "valid",
      });

      tickets.push(ticket);
    }

    console.log("🎟 TICKETS CREATED:", tickets.length);

    // -------------------------
    // 3. EMAIL (SINGLE EMAIL)
    // -------------------------
    const email = session.customer_details?.email;

    if (email) {
      await sendTicketEmail({
        email,
        order,
        tickets,
      });

      console.log("📧 EMAIL SENT");
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
