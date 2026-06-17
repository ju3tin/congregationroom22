// app/api/webhooks/stripe/route.ts

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Ticket from "@/models/Ticket";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import { sendTicketEmail } from "@/lib/mailer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const safeObjectId = (id: any) => {
  return mongoose.Types.ObjectId.isValid(id) ? id : undefined;
};

export async function POST(req: NextRequest) {
  console.log("🔥 STRIPE WEBHOOK START");

  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;

  // -------------------------
  // 1. VERIFY STRIPE SIGNATURE
  // -------------------------
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

  console.log("📊 METADATA:", m);

  try {
    await dbConnect();

    // -------------------------
    // 2. CREATE ORDER (SAFE)
    // -------------------------
    const order = await Order.create({
      orderNumber: session.id,

      userId: safeObjectId(m.userId) || undefined,

      type: "ticket",

      items: [
        {
          itemType: "ticket",

          eventId: safeObjectId(m.eventId),

          tierId: safeObjectId(m.tierId),

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
    // 3. CREATE TICKETS
    // -------------------------
    const tickets = [];

    const ticketCount = Number(m.ticketCount || 1);

    for (let i = 0; i < ticketCount; i++) {
      const ticket = await Ticket.create({
        ticketCode: uuidv4(),

        orderId: order._id,

        eventId: safeObjectId(m.eventId),

        tierId: safeObjectId(m.tierId),

        userId: safeObjectId(m.userId),

        tierName: m.tierName || "General Admission",

        eventTitle: m.eventTitle || "Event",

        eventDate: m.eventDate
          ? new Date(m.eventDate)
          : new Date(),

        venue: typeof m.venue === "string"
          ? m.venue
          : "TBA",

        status: "valid",
      });

      tickets.push(ticket);
    }

    console.log("🎟 TICKETS CREATED:", tickets.length);

    // -------------------------
    // 4. EMAIL USER
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
