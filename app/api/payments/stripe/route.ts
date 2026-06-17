// app/api/payments/stripe/route.ts

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: NextRequest) {
  try {
    const {
      eventId,
      userId,
      ticketCount,
      price,
      eventTitle,
      eventDate,
      venue,
      email,
      tierId,
      tierName,
    } = await req.json();

    if (!eventId) {
      return NextResponse.json(
        { error: "Missing eventId" },
        { status: 400 }
      );
    }

    if (!price || price <= 0) {
      return NextResponse.json(
        { error: "Invalid ticket price" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      payment_method_types: ["card"],

      customer_email: email,

      allow_promotion_codes: true,

      line_items: [
        {
          price_data: {
            currency: "usd",

            product_data: {
              name: eventTitle || "Event Ticket",
              description: `${ticketCount} Ticket(s)`,
            },

            unit_amount: Math.round(price * 100),
          },

          quantity: ticketCount || 1,
        },
      ],

      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/events/success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/events/${eventId}`,

      metadata: {
        provider: "stripe",

        eventId: String(eventId),
        userId: String(userId || ""),

        ticketCount: String(ticketCount || 1),

        tierId: String(tierId || ""),
        tierName: String(
          tierName || "General Admission"
        ),

        eventTitle: String(
          eventTitle || "Event"
        ),

        eventDate: String(
          eventDate || new Date().toISOString()
        ),

        venue: String(venue || "TBA"),
      },
    });

    console.log("================================");
    console.log("🧾 STRIPE SESSION CREATED");
    console.log("Session:", session.id);
    console.log("Event:", eventTitle);
    console.log("Tickets:", ticketCount);
    console.log("Amount:", price);
    console.log("User:", userId);
    console.log("================================");

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (err: any) {
    console.error("❌ Stripe Checkout Error");
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        error: err.message,
      },
      { status: 500 }
    );
  }
}
