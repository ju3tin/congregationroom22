import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/db";
import Ticket from "@/models/Ticket";
import { generateQR } from "@/lib/qr";
import { sendTicketEmail } from "@/lib/mailer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: NextRequest) {
  console.log("================================");
  console.log("🔥 STRIPE WEBHOOK START");
  console.log("================================");

  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.log("❌ Missing stripe-signature");
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log("✅ Webhook verified");
    console.log("📦 Event Type:", event.type);
    console.log("📦 Event ID:", event.id);
  } catch (err: any) {
    console.log("❌ Stripe verification failed");
    console.log(err.message);

    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // Only process checkout session
  if (event.type !== "checkout.session.completed") {
    console.log("⏭ Ignoring event:", event.type);
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  console.log("🎉 CHECKOUT COMPLETED");
  console.log("📧 Email:", session.customer_details?.email);
  console.log("📦 Metadata:", session.metadata);

  try {
    await dbConnect();
    console.log("✅ MongoDB connected");

    // ==============================
    // VALIDATION
    // ==============================
    if (!session.metadata?.eventId) {
      console.log("❌ Missing eventId in metadata");
      return NextResponse.json({ error: "Missing metadata" });
    }

    // ==============================
    // CREATE TICKET
    // ==============================
    const ticketCode = `TKT-${Date.now()}`;

    console.log("🎟 Creating ticket:", ticketCode);

    const ticket = await Ticket.create({
      ticketCode,

      orderId: session.metadata.orderId,
      eventId: session.metadata.eventId,
      userId: session.metadata.userId,
      tierId: session.metadata.tierId,

      tierName: session.metadata.tierName || "General Admission",
      eventTitle: session.metadata.eventTitle || "Event",
      eventDate: session.metadata.eventDate
        ? new Date(session.metadata.eventDate)
        : new Date(),

      venue: session.metadata.venue || "TBA",

      status: "valid",
    });

    console.log("✅ Ticket saved:", ticket._id);

    // ==============================
    // QR CODE
    // ==============================
    console.log("🔲 Generating QR...");
    const qrCode = await generateQR(ticketCode);
    console.log("✅ QR generated");

    // ==============================
    // EMAIL
    // ==============================
    const email = session.customer_details?.email;

    if (!email) {
      console.log("⚠️ No email found");
      return NextResponse.json({ received: true });
    }

    console.log("📧 Sending email to:", email);

    await sendTicketEmail({
      email,
      ticketCode,
      qrCode,
    });

    console.log("✅ Email sent");
  } catch (err: any) {
    console.log("❌ WEBHOOK ERROR");
    console.log(err.message);
  }

  console.log("================================");
  console.log("✅ WEBHOOK COMPLETE");
  console.log("================================");

  return NextResponse.json({ received: true });
}
