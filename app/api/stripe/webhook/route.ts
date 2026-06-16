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
    console.log("❌ Missing stripe-signature header");

    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );
  }

  const body = await req.text();

  console.log("✅ Signature received");

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
  } catch (error: any) {
    console.log("❌ Signature verification failed");
    console.log(error);

    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.log("❌ MongoDB Connection Failed");
    console.log(error);

    return NextResponse.json(
      { error: "Database error" },
      { status: 500 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      console.log("🎉 PAYMENT COMPLETED");

      const session = event.data.object as Stripe.Checkout.Session;

      console.log("📋 Session ID:", session.id);
      console.log("📧 Customer Email:", session.customer_details?.email);
      console.log("💰 Payment Status:", session.payment_status);

      console.log("📦 Metadata:");
      console.log(session.metadata);

      try {
        const ticketCode = `TKT-${Date.now()}`;

        console.log("🎟 Creating Ticket");
        console.log("🎟 Ticket Code:", ticketCode);

        const ticket = await Ticket.create({
          ticketCode,

          orderId: session.metadata?.orderId,
          eventId: session.metadata?.eventId,
          tierId: session.metadata?.tierId,
          userId: session.metadata?.userId,

          tierName:
            session.metadata?.tierName ||
            "General Admission",

          eventTitle:
            session.metadata?.eventTitle ||
            "Untitled Event",

          eventDate:
            session.metadata?.eventDate
              ? new Date(session.metadata.eventDate)
              : new Date(),

          venue:
            session.metadata?.venue ||
            "Unknown Venue",

          status: "valid",
        });

        console.log("✅ Ticket Created");
        console.log("🆔 Ticket ID:", ticket._id);

        console.log("🔲 Generating QR");

        const qrCode = await generateQR(ticketCode);

        console.log("✅ QR Generated");

        const email =
          session.customer_details?.email;

        if (email) {
          console.log("📧 Sending Email");
          console.log("📧 To:", email);

          await sendTicketEmail({
            email,
            ticketCode,
            qrCode,
          });

          console.log("✅ Email Sent");
        } else {
          console.log(
            "⚠️ No customer email found"
          );
        }
      } catch (error) {
        console.log(
          "❌ Failed During Ticket Creation"
        );
        console.log(error);
      }

      break;
    }

    default:
      console.log(
        "ℹ️ Unhandled Event:",
        event.type
      );
  }

  console.log("================================");
  console.log("✅ WEBHOOK COMPLETE");
  console.log("================================");

  return NextResponse.json({
    received: true,
  });
}
