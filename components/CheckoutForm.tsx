// Partial of app/components/CheckoutForm.tsx
"use client";

import { createCheckoutSession } from "@/actions/stripe1";

const formAction = async (data: FormData): Promise<void> => {
  const { url } = await createCheckoutSession(data);
  window.location.assign(url as string);
};

return (
  <form action={formAction}>
    <input type="hidden" name="uiMode" value="hosted" />
    {/* donation input */}
    <button type="submit">Donate</button>
  </form>
);
