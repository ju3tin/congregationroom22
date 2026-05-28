"use client"

import { useState } from "react"
import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCartStore, type CartItem } from "@/lib/cart-store"
import { toast } from "sonner"

interface TicketTier {
  _id: string
  name: string
  price: number
  quantity: number
  sold: number
  maxPerOrder: number
  salesStart: Date
  salesEnd: Date
}

interface TicketSelectorProps {
  eventId: string
  eventTitle: string
  eventDate: string
  eventImage: string
  tiers: TicketTier[]
}

export function TicketSelector({
  eventId,
  eventTitle,
  eventDate,
  eventImage,
  tiers,
}: TicketSelectorProps) {
  const addItem = useCartStore((s) => s.addItem)
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  const updateQuantity = (tierId: string, delta: number, max: number) => {
    setQuantities((prev) => {
      const current = prev[tierId] || 0
      const newQty = Math.max(0, Math.min(current + delta, max))
      return { ...prev, [tierId]: newQty }
    })
  }

  const handleAddToCart = () => {
    let added = false
    tiers.forEach((tier) => {
      const qty = quantities[tier._id] || 0
      if (qty > 0) {
        const item: CartItem = {
          id: `${eventId}-${tier._id}`,
          type: "ticket",
          name: `${eventTitle} - ${tier.name}`,
          price: tier.price,
          quantity: qty,
          image: eventImage,
          eventId,
          eventTitle,
          eventDate,
          tierId: tier._id,
          tierName: tier.name,
          maxPerOrder: tier.maxPerOrder,
        }
        addItem(item)
        added = true
      }
    })

    if (added) {
      toast.success("Tickets added to cart")
      setQuantities({})
    }
  }

  const total = tiers.reduce((sum, tier) => {
    const qty = quantities[tier._id] || 0
    return sum + tier.price * qty
  }, 0)

  const hasSelection = Object.values(quantities).some((qty) => qty > 0)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select Tickets</h3>
      <div className="space-y-3">
        {tiers.map((tier) => {
          const available = tier.quantity - tier.sold
          const soldOut = available <= 0
          const now = new Date()
          const salesStart = new Date(tier.salesStart)
          const salesEnd = new Date(tier.salesEnd)
          const notYetOnSale = now < salesStart
          const salesEnded = now > salesEnd
          const qty = quantities[tier._id] || 0
          const maxQty = Math.min(tier.maxPerOrder, available)

          return (
            <Card
              key={tier._id}
              className={`border-border ${
                soldOut || notYetOnSale || salesEnded
                  ? "opacity-60"
                  : ""
              }`}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <h4 className="font-semibold">{tier.name}</h4>
                  <p className="text-lg font-bold">${tier.price.toFixed(2)}</p>
                  {soldOut ? (
                    <p className="text-sm text-destructive">Sold Out</p>
                  ) : notYetOnSale ? (
                    <p className="text-sm text-muted-foreground">
                      On sale soon
                    </p>
                  ) : salesEnded ? (
                    <p className="text-sm text-muted-foreground">
                      Sales ended
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {available} available (max {tier.maxPerOrder} per order)
                    </p>
                  )}
                </div>
                {!soldOut && !notYetOnSale && !salesEnded && (
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(tier._id, -1, maxQty)}
                      disabled={qty === 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-semibold">{qty}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(tier._id, 1, maxQty)}
                      disabled={qty >= maxQty}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {hasSelection && (
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-bold">${total.toFixed(2)}</span>
          </div>
          <Button onClick={handleAddToCart} className="mt-4 w-full" size="lg">
            Add to Cart
          </Button>
        </div>
      )}
    </div>
  )
}
