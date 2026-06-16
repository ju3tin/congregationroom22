// Partial of app/actions/stripe.ts
"use server";

import type { Stripe } from "stripe";
import { stripe } from "@/lib/stripe";
import { formatAmountForStripe } from "@/utils/stripe-helpers";
import { CURRENCY } from "@/config";

export async function createCheckoutSession(
  data: FormData,
): Promise<{ client_secret: string | null; url: string | null }> {
  const checkoutSession: Stripe.Checkout.Session =
    await stripe.checkout.sessions.create({
      mode: "payment",
      submit_type: "donate",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: CURRENCY,
            product_data: { name: "Custom amount donation" },
            unit_amount: formatAmountForStripe(
              Number(data.get("customDonation") as string),
              CURRENCY,
            ),
          },
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/result.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/test01`,
    });

  return {
    client_secret: checkoutSession.client_secret,
    url: checkoutSession.url,
  };
}
