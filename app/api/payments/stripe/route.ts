import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: NextRequest) {
  try {
    const { eventId, userId, orderId, price } = await req.json();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Event Ticket",
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],

      success_url: `https://congregationroom22.vercel.app/events/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://congregationroom22.vercel.app/events/${eventId}`,

      // 🔥 CRITICAL: metadata MUST exist
      metadata: {
        eventId,
        userId,
        orderId,
        tierName: "General Admission",
        eventTitle: "Event",
        eventDate: new Date().toISOString(),
        venue: "TBA",
      },
    });

    console.log("🧾 Checkout session created:", session.id);

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.log("❌ Stripe Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
