// app/api/webhooks/stripe/route.ts

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Ticket from "@/models/Ticket";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { sendTicketEmail } from "@/lib/mailer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const SYSTEM_USER_ID = "6a18669c5d6662e81cfb373f";

const safeObjectId = (id: any) =>
  mongoose.Types.ObjectId.isValid(id) ? id : undefined;

export async function POST(req: NextRequest) {
  console.log("🔥 STRIPE WEBHOOK START");

  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;

  // ----------------------------
  // VERIFY STRIPE SIGNATURE
  // ----------------------------
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

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const m = session.metadata || {};

  console.log("📦 METADATA:", m);

  try {
    await dbConnect();

    // ----------------------------
    // SAFE USER + EMAIL
    // ----------------------------
    const userId = safeObjectId(m.userId) || SYSTEM_USER_ID;

    const email =
      session.customer_details?.email || m.email;

    if (!email) {
      throw new Error("Missing customer email");
    }

    // ----------------------------
    // CREATE ORDER (FIXED)
    // ----------------------------
    const order = await Order.create({
      orderNumber: session.id,

      userId,

      paymentProvider: "stripe",

       paypalOrderId: session.id,

      paymentIntentId: session.payment_intent,

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

      status: "paid",
    });

    console.log("🧾 ORDER CREATED:", order._id);

    // ----------------------------
    // CREATE TICKETS
    // ----------------------------
    const tickets = [];

    const count = Number(m.ticketCount || 1);

    for (let i = 0; i < count; i++) {
      const ticket = await Ticket.create({
        ticketCode: uuidv4(),

        orderId: order._id,

        eventId: safeObjectId(m.eventId),

        tierId: safeObjectId(m.tierId),

        userId,

        tierName: m.tierName || "General Admission",

        eventTitle: m.eventTitle || "Event",

        eventDate: m.eventDate
          ? new Date(m.eventDate)
          : new Date(),

        venue:
          typeof m.venue === "string"
            ? m.venue
            : "TBA",

        status: "valid",
      });

      tickets.push(ticket);
    }

    console.log("🎟 TICKETS CREATED:", tickets.length);

    // ----------------------------
    // EMAIL
    // ----------------------------
    await sendTicketEmail({
      email,
      order,
      tickets,
    });

    console.log("📧 EMAIL SENT");

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
