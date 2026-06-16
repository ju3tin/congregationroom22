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
    <form action={formAction} className="space-y-4">
      <input
        type="hidden"
        name="uiMode"
        value="hosted"
      />

      <div>
        <label htmlFor="amount">
          Donation Amount (£)
        </label>

        <input
          id="amount"
          name="amount"
          type="number"
          min="1"
          step="1"
          required
          placeholder="10"
          className="border rounded px-3 py-2 w-full"
        />
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Donate
      </button>
    </form>
  );
}
