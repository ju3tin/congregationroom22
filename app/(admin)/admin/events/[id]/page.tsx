"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { updateEvent, getEvent } from "@/app/actions/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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

interface DJOption {
  _id: string;
  name: string;
}

interface TicketTier {
  name: string;
  price: number;
  quantity: number;
  maxPerOrder: number;
  salesStart: string;
  salesEnd: string;
}

interface LineupItem {
  dj: string;
  setTime?: string;
  headline: boolean;
}

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [djs, setDjs] = useState<DJOption[]>([]);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [venueCity, setVenueCity] = useState("");
  const [date, setDate] = useState("");
  const [doors, setDoors] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "cancelled">("draft");
  const [featured, setFeatured] = useState(false);

  const [tiers, setTiers] = useState<TicketTier[]>([]);
  const [lineup, setLineup] = useState<LineupItem[]>([]);

  // Load Event Data
  useEffect(() => {
    async function loadEvent() {
      try {
        const [eventData, djsData] = await Promise.all([
          getEvent(id),
          fetch("/api/djs").then(r => r.json())
        ]);

        if (!eventData) {
          toast.error("Event not found");
          router.push("/admin/events");
          return;
        }

        setTitle(eventData.title);
        setSlug(eventData.slug);
        setDescription(eventData.description);
        setImage(eventData.image);
        setVenueName(eventData.venue?.name || "");
        setVenueAddress(eventData.venue?.address || "");
        setVenueCity(eventData.venue?.city || "");
        setDate(new Date(eventData.date).toISOString().slice(0, 16));
        setDoors(new Date(eventData.doors).toISOString().slice(0, 16));
        setStatus(eventData.status);
        setFeatured(eventData.featured || false);
        setTiers(eventData.ticketTiers || []);
        setLineup(eventData.lineup || []);
        setDjs(djsData);

      } catch (error) {
        toast.error("Failed to load event");
      } finally {
        setInitialLoading(false);
      }
    }

    loadEvent();
  }, [id, router]);

  // Ticket Tier Handlers
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

  // Lineup Handlers
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
    formData.append("status", status);
    formData.append("featured", featured.toString());

    const result = await updateEvent(id, formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Event updated successfully");
      router.push("/admin/events");
    }
    setLoading(false);
  }

  if (initialLoading) return <div className="p-12 text-center">Loading event...</div>;

  return (
    <form action={handleSubmit} className="space-y-8 max-w-5xl mx-auto p-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/events" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <h1 className="text-3xl font-bold">Edit Event</h1>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <Input id="image" name="image" type="url" value={image} onChange={(e) => setImage(e.target.value)} required />
          </div>
        </CardContent>
      </Card>

      {/* Venue */}
      <Card>
        <CardHeader><CardTitle>Venue</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="venueName">Venue Name</Label>
            <Input id="venueName" name="venueName" value={venueName} onChange={(e) => setVenueName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="venueAddress">Address</Label>
            <Input id="venueAddress" name="venueAddress" value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="venueCity">City</Label>
            <Input id="venueCity" name="venueCity" value={venueCity} onChange={(e) => setVenueCity(e.target.value)} required />
          </div>
        </CardContent>
      </Card>

      {/* Date & Time */}
      <Card>
        <CardHeader><CardTitle>Date & Time</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Event Date & Time</Label>
              <Input id="date" name="date" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doors">Doors Open</Label>
              <Input id="doors" name="doors" type="datetime-local" value={doors} onChange={(e) => setDoors(e.target.value)} required />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured */}
      <Card>
        <CardHeader><CardTitle>Featured on Homepage</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={featured}
              onCheckedChange={setFeatured}
            />
            <div>
              <Label className="text-base">Mark as Featured Event</Label>
              <p className="text-sm text-muted-foreground">
                This event will appear in the Featured Events section on the front page
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DJ Lineup */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>DJ Lineup</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addLineupItem}>
            <Plus className="mr-2 h-4 w-4" /> Add DJ
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {lineup.map((item, index) => (
            <div key={index} className="rounded-lg border p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">DJ {index + 1}</h4>
                {lineup.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeLineupItem(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <Label>DJ</Label>
                <Select value={item.dj} onValueChange={(v) => updateLineupItem(index, "dj", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select DJ" />
                  </SelectTrigger>
                  <SelectContent>
                    {djs.map((dj) => (
                      <SelectItem key={dj._id} value={dj._id}>
                        {dj.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Set Time</Label>
                  <Input
                    type="datetime-local"
                    value={item.setTime || ""}
                    onChange={(e) => updateLineupItem(index, "setTime", e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3 pt-8">
                  <Checkbox
                    checked={item.headline}
                    onCheckedChange={(checked) => updateLineupItem(index, "headline", !!checked)}
                  />
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
          <Button type="button" variant="outline" size="sm" onClick={addTier}>
            <Plus className="mr-2 h-4 w-4" /> Add Tier
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {tiers.map((tier, index) => (
            <div key={index} className="rounded-lg border p-4 space-y-4">
              <div className="flex items-center justify-between">
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
                    min="0"
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
                    min="1"
                    value={tier.quantity}
                    onChange={(e) => updateTier(index, "quantity", parseInt(e.target.value) || 1)}
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
          {loading ? "Updating..." : "Update Event"}
        </Button>
      </div>
    </form>
  );
}
