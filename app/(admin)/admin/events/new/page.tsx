"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createEvent } from "../actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DJOption { _id: string; name: string; }

export default function NewEventPage({ djs }: { djs: DJOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  const [featured, setFeatured] = useState(false);

  const [tiers, setTiers] = useState([{
    name: "General Admission",
    price: 50,
    quantity: 100,
    maxPerOrder: 10,
    salesStart: new Date().toISOString().slice(0, 16),
    salesEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  }]);

  const [lineup, setLineup] = useState([{ dj: "", setTime: "", headline: false }]);

  const addTier = () => {
    setTiers([...tiers, {
      name: "", price: 0, quantity: 100, maxPerOrder: 10,
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

  const addLineupItem = () => setLineup([...lineup, { dj: "", setTime: "", headline: false }]);
  const removeLineupItem = (index: number) => {
    if (lineup.length > 1) setLineup(lineup.filter((_, i) => i !== index));
  };
  const updateLineupItem = (index: number, field: string, value: any) => {
    const updated = [...lineup];
    updated[index] = { ...updated[index], [field]: value };
    setLineup(updated);
  };

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    formData.append("ticketTiers", JSON.stringify(tiers));
    formData.append("lineup", JSON.stringify(lineup));
    formData.append("featured", featured.toString());

    startTransition(async () => {
      const result = await createEvent(formData);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Event created successfully");
        router.push("/admin/events");
      }
      setLoading(false);
    });
  };

  return (
    <form action={handleSubmit} className="space-y-8 max-w-5xl mx-auto p-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/events" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <h1 className="text-3xl font-bold">Create New Event</h1>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label htmlFor="title">Title</Label><Input id="title" name="title" required /></div>
            <div><Label htmlFor="slug">Slug</Label><Input id="slug" name="slug" required placeholder="my-event-2026" /></div>
          </div>
          <div><Label htmlFor="description">Description</Label><Textarea id="description" name="description" rows={5} required /></div>
          <div><Label htmlFor="image">Image URL</Label><Input id="image" name="image" type="url" required /></div>
        </CardContent>
      </Card>

      {/* Venue */}
      <Card>
        <CardHeader><CardTitle>Venue</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label htmlFor="venueName">Venue Name</Label><Input id="venueName" name="venueName" required /></div>
          <div><Label htmlFor="venueAddress">Address</Label><Input id="venueAddress" name="venueAddress" required /></div>
          <div><Label htmlFor="venueCity">City</Label><Input id="venueCity" name="venueCity" required /></div>
        </CardContent>
      </Card>

      {/* Date & Time */}
      <Card>
        <CardHeader><CardTitle>Date & Time</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label htmlFor="date">Event Date & Time</Label><Input id="date" name="date" type="datetime-local" required /></div>
            <div><Label htmlFor="doors">Doors Open</Label><Input id="doors" name="doors" type="datetime-local" required /></div>
          </div>
          <div><Label htmlFor="endDate">End Date (Optional)</Label><Input id="endDate" name="endDate" type="datetime-local" /></div>
        </CardContent>
      </Card>

      {/* Featured */}
      <Card>
        <CardHeader><CardTitle>Featured</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Switch checked={featured} onCheckedChange={setFeatured} />
            <Label>Mark as Featured Event</Label>
          </div>
        </CardContent>
      </Card>

      {/* DJ Lineup */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>DJ Lineup</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addLineupItem}><Plus className="mr-2 h-4 w-4" /> Add DJ</Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {lineup.map((item, index) => (
            <div key={index} className="border p-4 rounded-lg space-y-4">
              <div className="flex justify-between">
                <h4>DJ {index + 1}</h4>
                {lineup.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeLineupItem(index)}><Trash2 className="h-4 w-4" /></Button>}
              </div>
              <Select value={item.dj} onValueChange={(v) => updateLineupItem(index, "dj", v)}>
                <SelectTrigger><SelectValue placeholder="Select DJ" /></SelectTrigger>
                <SelectContent>
                  {djs.map(dj => <SelectItem key={dj._id} value={dj._id}>{dj.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Set Time</Label><Input type="datetime-local" value={item.setTime} onChange={e => updateLineupItem(index, "setTime", e.target.value)} /></div>
                <div className="flex items-center gap-3 pt-8">
                  <Checkbox checked={item.headline} onCheckedChange={c => updateLineupItem(index, "headline", !!c)} />
                  <Label>Headline Act</Label>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Ticket Tiers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ticket Tiers</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addTier}><Plus className="mr-2 h-4 w-4" /> Add Tier</Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {tiers.map((tier, index) => (
            <div key={index} className="border p-4 rounded-lg space-y-4">
              <div className="flex justify-between">
                <h4>Tier {index + 1}</h4>
                {tiers.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeTier(index)}><Trash2 className="h-4 w-4" /></Button>}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Name</Label><Input value={tier.name} onChange={e => updateTier(index, "name", e.target.value)} required /></div>
                <div><Label>Price ($)</Label><Input type="number" step="0.01" value={tier.price} onChange={e => updateTier(index, "price", parseFloat(e.target.value) || 0)} required /></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Quantity</Label><Input type="number" value={tier.quantity} onChange={e => updateTier(index, "quantity", parseInt(e.target.value) || 1)} required /></div>
                <div><Label>Max Per Order</Label><Input type="number" value={tier.maxPerOrder} onChange={e => updateTier(index, "maxPerOrder", parseInt(e.target.value) || 1)} required /></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Sales Start</Label><Input type="datetime-local" value={tier.salesStart} onChange={e => updateTier(index, "salesStart", e.target.value)} required /></div>
                <div><Label>Sales End</Label><Input type="datetime-local" value={tier.salesEnd} onChange={e => updateTier(index, "salesEnd", e.target.value)} required /></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" asChild><Link href="/admin/events">Cancel</Link></Button>
        <Button type="submit" disabled={loading || isPending}>
          {loading || isPending ? "Creating..." : "Create Event"}
        </Button>
      </div>
    </form>
  );
}
