'use server'

import { headers } from 'next/headers'

import { stripe } from '@/lib/stripe'

export async function fetchClientSecret() {
  const origin = (await headers()).get('origin')

  // Create Checkout Sessions from body params.
  const session = await stripe.checkout.sessions.create({

    ui_mode: 'embedded_page',
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
    mode: 'payment',
    return_url: `${origin}/return?session_id={CHECKOUT_SESSION_ID}`,
  })

  return session.client_secret
}
