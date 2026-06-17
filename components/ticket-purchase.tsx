// /components/ticket-purchase.tsx

"use client";

import { useState } from "react";
import { Ticket, Minus, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";

interface TicketPurchaseProps {
  event: any;
  ticketPrice: number;
  userId?: string;
}

export default function TicketPurchase({
  event,
  ticketPrice,
  userId,
}: TicketPurchaseProps) {
  const [ticketCount, setTicketCount] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<
    "stripe" | "paypal"
  >("stripe");

  const totalAmount = ticketPrice * ticketCount;

  const handleCheckout = async () => {
    try {
      setIsProcessing(true);

      const payload = {
        eventId: event._id,
        userId,
        ticketCount,
        price: ticketPrice,
        total: totalAmount,
        eventTitle: event.title,
        eventDate: event.date,
        venue: event.venue,
      };

      const endpoint =
        selectedPayment === "stripe"
          ? "/api/payments/stripe"
          : "/api/payments/paypal";

      const response = await axios.post(endpoint, payload);

      if (response.data.url) {
        window.location.href = response.data.url;
        return;
      }

      alert("Checkout URL not returned.");
    } catch (error: any) {
      console.error(error);
      alert(
        error?.response?.data?.error ||
          "Failed to start checkout."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-2">
          Get Tickets
        </h2>

        <p className="text-muted-foreground text-sm mb-6">
          Secure your spot at this event
        </p>

        {/* Payment Method */}

        <div className="grid grid-cols-2 gap-2 mb-6">
          <Button
            type="button"
            variant={
              selectedPayment === "stripe"
                ? "default"
                : "outline"
            }
            onClick={() =>
              setSelectedPayment("stripe")
            }
          >
            Stripe
          </Button>

          <Button
            type="button"
            variant={
              selectedPayment === "paypal"
                ? "default"
                : "outline"
            }
            onClick={() =>
              setSelectedPayment("paypal")
            }
          >
            PayPal
          </Button>
        </div>

        {/* Price */}

        <div className="flex justify-between items-center mb-6">
          <span className="font-medium">
            Ticket Price
          </span>

          <span className="text-2xl font-bold text-primary">
            ${ticketPrice.toFixed(2)}
          </span>
        </div>

        {/* Quantity */}

        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary mb-6">
          <span className="font-medium">
            Quantity
          </span>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setTicketCount(
                  Math.max(1, ticketCount - 1)
                )
              }
              disabled={ticketCount === 1}
            >
              <Minus className="w-4 h-4" />
            </Button>

            <span className="font-semibold w-8 text-center">
              {ticketCount}
            </span>

            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setTicketCount(
                  Math.min(10, ticketCount + 1)
                )
              }
              disabled={ticketCount === 10}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Summary */}

        <div className="border-t pt-4 mb-6">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>

            <span className="text-primary">
              ${totalAmount.toFixed(2)}
            </span>
          </div>

          <p className="text-xs text-muted-foreground mt-1">
            {ticketCount} ticket
            {ticketCount > 1 ? "s" : ""}
          </p>
        </div>

        {/* Checkout */}

        <Button
          className="w-full"
          size="lg"
          onClick={handleCheckout}
          disabled={isProcessing}
        >
          {isProcessing ? (
            "Processing..."
          ) : (
            <>
              <Ticket className="w-4 h-4 mr-2" />
              Pay ${totalAmount.toFixed(2)} with{" "}
              {selectedPayment === "stripe"
                ? "Stripe"
                : "PayPal"}
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Tickets are emailed instantly after successful
          payment.
        </p>
      </CardContent>
    </Card>
  );
}
