"use client";

import { createCheckoutSession } from "@/app/actions/stripe1";

export default function CheckoutForm() {
  const formAction = async (formData: FormData) => {
    const { url } = await createCheckoutSession(formData);

    if (url) {
      window.location.href = url;
    }
  };

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="customDonation"
          className="block mb-2 font-medium"
        >
          Donation Amount (£)
        </label>

        <input
          id="customDonation"
          name="customDonation"
          type="number"
          min="1"
          step="1"
          required
          placeholder="10"
          className="w-full border rounded-md px-4 py-2"
        />
      </div>

      <button
        type="submit"
        className="bg-primary text-white px-4 py-2 rounded"
      >
        Donate
      </button>
    </form>
  );
}
