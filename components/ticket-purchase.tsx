'use client';

import { useState } from "react";
import { Ticket, Minus, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

interface TicketPurchaseProps {
  event: any;
  ticketPrice: number;
}

export default function TicketPurchase({ event, ticketPrice }: TicketPurchaseProps) {
  const [ticketCount, setTicketCount] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<"stripe" | "paypal">("stripe");

  const totalAmount = ticketPrice * ticketCount;

  const handleStripePayment = async () => {
    try {
      setIsProcessing(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

      const res = await axios.post(`${apiUrl}/api/payments/stripe`, {
        eventId: event._id || event.id,
        ticketCount,
        price: ticketPrice,
      });

      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      alert("Payment initialization failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-2">Get Tickets</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Secure your spot at this event
        </p>

        {/* Payment Method Toggle */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={selectedPayment === "stripe" ? "default" : "outline"}
            onClick={() => setSelectedPayment("stripe")}
            className="flex-1"
          >
            Stripe
          </Button>
          <Button
            variant={selectedPayment === "paypal" ? "default" : "outline"}
            onClick={() => setSelectedPayment("paypal")}
            className="flex-1"
          >
            PayPal
          </Button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <span className="font-medium">Ticket Price</span>
          <span className="text-2xl font-bold text-primary">${ticketPrice}</span>
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center justify-between mb-6 p-4 bg-secondary rounded-lg">
          <span className="font-medium">Quantity</span>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
              disabled={ticketCount <= 1}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-8 text-center font-semibold">{ticketCount}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setTicketCount(Math.min(10, ticketCount + 1))}
              disabled={ticketCount >= 10}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Total */}
        <div className="border-t border-border pt-4 mb-6">
          <div className="flex items-center justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">${totalAmount.toFixed(2)}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Including all fees and taxes
          </p>
        </div>

        {/* Pay Button */}
        <Button
          className="w-full bg-primary hover:bg-primary/90"
          size="lg"
          onClick={handleStripePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            "Processing..."
          ) : (
            <>
              <Ticket className="w-4 h-4 mr-2" />
              Pay ${totalAmount.toFixed(2)} with {selectedPayment === "stripe" ? "Stripe" : "PayPal"}
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center mt-4">
          By purchasing, you agree to our Terms & Conditions
        </p>
      </CardContent>
    </Card>
  );
}
