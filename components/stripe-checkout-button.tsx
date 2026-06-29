"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

interface StripeCheckoutButtonProps {
  productId: string;
  productName: string;
  price: number;
  variantName?: string;
}

export default function StripeCheckoutButton({
  productId,
  productName,
  price,
  variantName = "Default",
}: StripeCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          productName,
          price,
          variantName,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to create checkout session");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      size="lg" 
      className="w-full text-lg py-7" 
      onClick={handleCheckout}
      disabled={loading}
    >
      {loading ? (
        "Processing..."
      ) : (
        <>
          <ShoppingCart className="mr-3 h-5 w-5" />
          Buy Now - ${price}
        </>
      )}
    </Button>
  );
}
