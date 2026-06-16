import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(request: NextRequest) {
  try {
    const { eventId, ticketCount, price } = await request.json();

    const baseUrl = "https://congregationroom22.vercel.app";

    if (!baseUrl) {
      throw new Error("Missing NEXT_PUBLIC_SITE_URL");
    }

    const successUrl = new URL(
      `/result.html?session_id={CHECKOUT_SESSION_ID}`,
      baseUrl
    ).toString();

    const cancelUrl = new URL(
      `/events/${eventId}`,
      baseUrl
    ).toString();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Event Ticket",
              description: `Tickets for event #${eventId}`,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: ticketCount,
        },
      ],

      success_url: successUrl,
      cancel_url: cancelUrl,

      metadata: {
        eventId,
        ticketCount: String(ticketCount),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Error:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
