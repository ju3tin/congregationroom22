import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import Ticket from "@/models/Ticket";
import { generateQR } from "@/lib/qr";
import { sendTicketEmail } from "@/lib/mailer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  console.log("🔥 WEBHOOK TRIGGERED");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.log("❌ Invalid signature:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const email = session.customer_details?.email;
    const eventId = session.metadata?.eventId;

    console.log("🎉 PAYMENT SUCCESS");

    if (!email || !eventId) {
      console.log("❌ Missing metadata");
      return NextResponse.json({ ok: true });
    }

    // =========================
    // 1. CREATE TICKET CODE
    // =========================
    const ticketCode = `TKT-${session.id.slice(-10).toUpperCase()}`;

    console.log("🎟 Ticket:", ticketCode);

    // =========================
    // 2. GENERATE QR
    // =========================
    const qrCode = await generateQR(ticketCode);

    // =========================
    // 3. SAVE TO DB
    // =========================
    await Ticket.create({
      ticketCode,
      eventId,
      orderId: session.metadata?.orderId,
      userId: session.metadata?.userId,
      tierId: session.metadata?.tierId,

      tierName: session.metadata?.tierName || "General Admission",
      eventTitle: session.metadata?.eventTitle || "Event",
      eventDate: session.metadata?.eventDate
        ? new Date(session.metadata.eventDate)
        : new Date(),
      venue: session.metadata?.venue || "TBA",

      status: "valid",
    });

    console.log("💾 Ticket saved");

    // =========================
    // 4. SEND EMAIL
    // =========================
    await sendTicketEmail({
      email,
      ticketCode,
      qrCode,
    });

    console.log("📧 Email sent");
  }

  return NextResponse.json({ received: true });
}
