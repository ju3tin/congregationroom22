"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createEvent } from "@app/actions/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    featured: false,
  });

  const [tiers, setTiers] = useState([
    {
      name: "General Admission",
      price: 50,
      quantity: 100,
      maxPerOrder: 10,
      salesStart: new Date().toISOString().slice(0, 16),
      salesEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    },
  ]);

  const [lineup, setLineup] = useState([{ dj: "", headline: false }]);

  // Tier handlers
  const addTier = () => {
    setTiers([...tiers, {
      name: "",
      price: 0,
      quantity: 100,
      maxPerOrder: 10,
      salesStart: new Date().toISOString().slice(0, 16),
      salesEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    }]);
  };

  const removeTier = (index: number) => {
    if (tiers.length > 1) setTiers(tiers.filter((_, i) => i !== index));
  };

  const updateTier = (index: number, field: string, value: any) => {
    const updated = [...tiers];
    updated[index] = { ...updated[index], [field]: value };
    setTiers(updated);
  };

  // Lineup handlers
  const addLineupItem = () => setLineup([...lineup, { dj: "", headline: false }]);
  const removeLineupItem = (index: number) => {
    if (lineup.length > 1) setLineup(lineup.filter((_, i) => i !== index));
  };
  const updateLineupItem = (index: number, field: string, value: any) => {
    const updated = [...lineup];
    updated[index] = { ...updated[index], [field]: value };
    setLineup(updated);
  };

  async function handleSubmit(formData: FormData) {
    setLoading(true);

    formData.append("ticketTiers", JSON.stringify(tiers));
    formData.append("lineup", JSON.stringify(lineup));
    formData.append("featured", form.featured.toString());

    const result = await createEvent(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Event created successfully");
      router.push("/admin/events");
    }
    setLoading(false);
  }

  return (
    <form action={handleSubmit} className="space-y-8 max-w-5xl mx-auto p-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/events" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <h1 className="text-3xl font-bold">Create New Event</h1>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Title</Label><Input name="title" required /></div>
            <div><Label>Slug</Label><Input name="slug" required placeholder="summer-rave-2026" /></div>
          </div>
          <div><Label>Description</Label><Textarea name="description" rows={5} required /></div>
          <div><Label>Image URL</Label><Input name="image" type="url" required /></div>
        </CardContent>
      </Card>

      {/* Venue & Date */}
      <Card>
        <CardHeader><CardTitle>Venue & Date</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div><Label>Venue Name</Label><Input name="venueName" required /></div>
            <div><Label>Address</Label><Input name="venueAddress" required /></div>
            <div><Label>City</Label><Input name="venueCity" required /></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Event Date & Time</Label><Input name="date" type="datetime-local" required /></div>
            <div><Label>Doors Open</Label><Input name="doors" type="datetime-local" required /></div>
          </div>
        </CardContent>
      </Card>

      {/* Featured */}
      <Card>
        <CardHeader><CardTitle>Featured on Homepage</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
            <Label>Mark this event as Featured</Label>
          </div>
        </CardContent>
      </Card>

      {/* Lineup & Ticket Tiers - you can keep your existing code here */}

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/events">Cancel</Link>
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Event"}
        </Button>
      </div>
    </form>
  );
}
