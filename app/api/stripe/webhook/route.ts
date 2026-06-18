import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Ticket from "@/models/Ticket";
import { sendTicketEmail } from "@/lib/mailer2";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const SYSTEM_USER_ID = "6a18669c5d6662e81cfb373f";

function safeObjectId(id: any) {
  return mongoose.Types.ObjectId.isValid(id)
    ? new mongoose.Types.ObjectId(id)
    : new mongoose.Types.ObjectId(SYSTEM_USER_ID);
}

export async function POST(req: NextRequest) {
  console.log("🔥 STRIPE WEBHOOK START");

  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.log("❌ INVALID SIGNATURE:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  try {
    await dbConnect();

    const session = event.data.object as Stripe.Checkout.Session;
    const m = session.metadata || {};

    console.log("📦 METADATA:", m);

    // -----------------------
    // REQUIRED FIELDS
    // -----------------------
    const eventId = safeObjectId(m.eventId);
    const tierId = safeObjectId(m.tierId);
    const userId = safeObjectId(m.userId);

    if (!eventId) throw new Error("Missing eventId");
    if (!tierId) throw new Error("Missing tierId");

    const finalUserId = userId || new mongoose.Types.ObjectId(SYSTEM_USER_ID);

    const email =
      session.customer_details?.email || m.email;

    if (!email) throw new Error("Missing customer email");

    const ticketCount = Number(m.ticketCount || 1);
    const total = (session.amount_total || 0) / 100;

    const eventDate = m.eventDate
      ? new Date(m.eventDate)
      : new Date();

    // -----------------------
    // VENUE FIX (STRING ONLY)
    // -----------------------
    let venueString = "TBA";

    try {
      const venueObj =
        typeof m.venue === "string"
          ? JSON.parse(m.venue)
          : m.venue;

      if (venueObj?.name) {
        venueString = `${venueObj.name}, ${venueObj.address}, ${venueObj.city}`;
      }
    } catch {
      venueString = m.venue || "TBA";
    }

    // -----------------------
    // CREATE ORDER
    // -----------------------
    const order = await Order.create({
      orderNumber: session.id,
      userId: finalUserId,
      type: "ticket",

      items: [
        {
          itemType: "ticket",
          eventId,
          tierId,
          quantity: ticketCount,
          unitPrice: total / ticketCount,
          name: m.tierName || "General Admission",
        },
      ],

      subtotal: total,
      discount: 0,
      total,

      paypalOrderId: session.id,
      paypalCaptureId: String(session.payment_intent || ""),

      status: "paid",
    });

    console.log("🧾 ORDER CREATED:", order._id);

    // -----------------------
    // CREATE TICKETS
    // -----------------------
    const tickets = [];

    for (let i = 0; i < ticketCount; i++) {
      const ticket = await Ticket.create({
        ticketCode: uuidv4(),
        orderId: order._id,
        eventId,
        tierId,
        userId: finalUserId,

        tierName: m.tierName || "General Admission",
        eventTitle: m.eventTitle || "Event",
        eventDate,

        venue: venueString,

        status: "valid",
      });

      tickets.push(ticket);
    }

    console.log("🎟 TICKETS CREATED:", tickets.length);

    // -----------------------
    // SEND EMAILS
    // -----------------------
    for (const ticket of tickets) {
      await sendTicketEmail({
        email,
        ticketCode: ticket.ticketCode,
        eventTitle: ticket.eventTitle,
        eventDate: ticket.eventDate,
        venue: ticket.venue,
      });
    }

    console.log("📧 EMAIL SENT");

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.log("❌ WEBHOOK ERROR:", err.message);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
