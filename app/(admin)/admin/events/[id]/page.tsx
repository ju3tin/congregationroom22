"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface TicketTier {
  name: string;
  price: number;
  quantity: number;
  maxPerOrder: number;
  salesStart: string;
  salesEnd: string;
}

interface EventData {
  _id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  status: string;
  venue: {
    name: string;
    address: string;
    city: string;
  };
  date: string;
  doors: string;
  ticketTiers: TicketTier[];
}

export default function EditEventPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [event, setEvent] = useState<EventData | null>(null);
  const [tiers, setTiers] = useState<TicketTier[]>([]);

  useEffect(() => {
    async function fetchEvent() {
      if (!id) return;

      try {
        const res = await fetch(`/api/admin/events/${id}`);
        if (!res.ok) throw new Error("Failed to fetch event");

        const data: EventData = await res.json();
        setEvent(data);
        setTiers(data.ticketTiers || []);
      } catch (error) {
        toast.error("Failed to load event");
        console.error(error);
      } finally {
        setInitialLoading(false);
      }
    }

    fetchEvent();
  }, [id]);

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
    ]);
  };

  const removeTier = (index: number) => {
    if (tiers.length > 1) {
      setTiers(tiers.filter((_, i) => i !== index));
    }
  };

  const updateTier = (index: number, field: keyof TicketTier, value: string | number) => {
    const updated = [...tiers];
    updated[index] = { ...updated[index], [field]: value };
    setTiers(updated);
  };

  async function handleSubmit(formData: FormData) {
    if (!id) return;
    setLoading(true);

    formData.append("ticketTiers", JSON.stringify(tiers));

    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: "PUT",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Failed to update");

      toast.success("Event updated successfully");
      router.push("/admin/events");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) return <div className="p-10 text-center">Loading event...</div>;
  if (!event) return <div className="p-10 text-center text-red-600">Event not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" asChild>
          <Link href="/admin/events">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Event</h1>
      </div>

      <form action={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input id="title" name="title" defaultValue={event.title} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" defaultValue={event.slug} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={event.description}
                rows={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input id="image" name="image" type="url" defaultValue={event.image} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={event.status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Venue */}
        <Card>
          <CardHeader>
            <CardTitle>Venue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="venueName">Venue Name</Label>
              <Input id="venueName" name="venueName" defaultValue={event.venue?.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="venueAddress">Address</Label>
              <Input id="venueAddress" name="venueAddress" defaultValue={event.venue?.address} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="venueCity">City</Label>
              <Input id="venueCity" name="venueCity" defaultValue={event.venue?.city} required />
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
                <Input
                  id="date"
                  name="date"
                  type="datetime-local"
                  defaultValue={event.date ? new Date(event.date).toISOString().slice(0, 16) : ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doors">Doors Open</Label>
                <Input
                  id="doors"
                  name="doors"
                  type="datetime-local"
                  defaultValue={event.doors ? new Date(event.doors).toISOString().slice(0, 16) : ""}
                  required
                />
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
              <div key={index} className="rounded-lg border p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Tier {index + 1}</h4>
                  {tiers.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeTier(index)}>
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
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={tier.price}
                      onChange={(e) => updateTier(index, "price", parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Total Quantity</Label>
                    <Input
                      type="number"
                      value={tier.quantity}
                      onChange={(e) => updateTier(index, "quantity", parseInt(e.target.value) || 1)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Per Order</Label>
                    <Input
                      type="number"
                      value={tier.maxPerOrder}
                      onChange={(e) => updateTier(index, "maxPerOrder", parseInt(e.target.value) || 1)}
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
                      onChange={(e) => updateTier(index, "salesStart", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sales End</Label>
                    <Input
                      type="datetime-local"
                      value={tier.salesEnd}
                      onChange={(e) => updateTier(index, "salesEnd", e.target.value)}
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
            {loading ? "Saving Changes..." : "Update Event"}
          </Button>
        </div>
      </form>
    </div>
  );
}
