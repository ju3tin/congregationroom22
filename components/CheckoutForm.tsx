"use client";

import { createCheckoutSession } from "@/app/actions/stripe1";

export default function CheckoutForm() {
  const formAction = async (data: FormData) => {
    const { url } = await createCheckoutSession(data);

    if (url) {
      window.location.assign(url);
    }
  };

  return (
    <form action={formAction}>
      <input
        type="hidden"
        name="uiMode"
        value="hosted"
      />

      <button type="submit">
        Donate
      </button>
    </form>
  );
}
