"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createEvent } from "../actions"
import { toast } from "sonner"

interface TicketTier {
  name: string
  price: number
  quantity: number
  maxPerOrder: number
  salesStart: string
  salesEnd: string
}

export default function NewEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [tiers, setTiers] = useState<TicketTier[]>([
    {
      name: "General Admission",
      price: 50,
      quantity: 100,
      maxPerOrder: 10,
      salesStart: new Date().toISOString().slice(0, 16),
      salesEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16),
    },
  ])

  const addTier = () => {
    setTiers([
      ...tiers,
      {
        name: "",
        price: 0,
        quantity: 100,
        maxPerOrder: 10,
        salesStart: new Date().toISOString().slice(0, 16),
        salesEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 16),
      },
    ])
  }

  const removeTier = (index: number) => {
    if (tiers.length > 1) {
      setTiers(tiers.filter((_, i) => i !== index))
    }
  }

  const updateTier = (index: number, field: keyof TicketTier, value: string | number) => {
    const updated = [...tiers]
    updated[index] = { ...updated[index], [field]: value }
    setTiers(updated)
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    formData.append("ticketTiers", JSON.stringify(tiers))

    const result = await createEvent(formData)

    if (result.error) {
      toast.error(result.error)
      setLoading(false)
    } else {
      toast.success("Event created successfully")
      router.push("/admin/events")
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-3xl font-bold">Create Event</h1>
      </div>

      <form action={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" name="slug" required placeholder="my-event" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={4} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                name="image"
                type="url"
                required
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue="draft">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Venue Info */}
        <Card>
          <CardHeader>
            <CardTitle>Venue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="venueName">Venue Name</Label>
              <Input id="venueName" name="venueName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="venueAddress">Address</Label>
              <Input id="venueAddress" name="venueAddress" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="venueCity">City</Label>
              <Input id="venueCity" name="venueCity" required />
            </div>
          </CardContent>
        </Card>

        {/* Date & Time */}
        <Card>
          <CardHeader>
            <CardTitle>Date & Time</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Event Date & Time</Label>
                <Input id="date" name="date" type="datetime-local" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doors">Doors Open</Label>
                <Input id="doors" name="doors" type="datetime-local" required />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Tiers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ticket Tiers</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addTier}>
              <Plus className="mr-2 h-4 w-4" />
              Add Tier
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {tiers.map((tier, index) => (
              <div
                key={index}
                className="rounded-lg border border-border p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Tier {index + 1}</h4>
                  {tiers.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTier(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Tier Name</Label>
                    <Input
                      value={tier.name}
                      onChange={(e) => updateTier(index, "name", e.target.value)}
                      placeholder="e.g., VIP, General Admission"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price ($)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={tier.price}
                      onChange={(e) =>
                        updateTier(index, "price", parseFloat(e.target.value) || 0)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Total Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={tier.quantity}
                      onChange={(e) =>
                        updateTier(index, "quantity", parseInt(e.target.value) || 1)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Per Order</Label>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={tier.maxPerOrder}
                      onChange={(e) =>
                        updateTier(index, "maxPerOrder", parseInt(e.target.value) || 1)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Sales Start</Label>
                    <Input
                      type="datetime-local"
                      value={tier.salesStart}
                      onChange={(e) =>
                        updateTier(index, "salesStart", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sales End</Label>
                    <Input
                      type="datetime-local"
                      value={tier.salesEnd}
                      onChange={(e) =>
                        updateTier(index, "salesEnd", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/events">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Event"}
          </Button>
        </div>
      </form>
    </div>
  )
}
