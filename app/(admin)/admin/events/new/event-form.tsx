"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createEvent } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";   // ← Added
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

interface EventFormProps {
  djs: DJOption[];
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

export default function EventForm({ djs }: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    featured: false,
  });

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
  ]);

  const [lineup, setLineup] = useState<LineupItem[]>([
    {
      dj: "",
      headline: false,
    },
  ]);

  // ... your existing addTier, removeTier, updateTier, addLineupItem, etc. functions remain the same ...

  async function handleSubmit(formData: FormData) {
    setLoading(true);

    formData.append("ticketTiers", JSON.stringify(tiers));
    formData.append("lineup", JSON.stringify(lineup));
    formData.append("featured", form.featured.toString());   // ← Added

    const result = await createEvent(formData);

    if (result.error) {
      toast.error(result.error);
      setLoading(false);
      return;
    }

    toast.success("Event created successfully");
    router.push("/admin/events");
  }

  return (
    <form action={handleSubmit} className="space-y-8">
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

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ... your existing basic info fields ... */}
        </CardContent>
      </Card>

      {/* Venue, Date & Time, Lineup, Ticket Tiers - keep as is */}

      {/* ==================== FEATURED SECTION ==================== */}
      <Card>
        <CardHeader>
          <CardTitle>Featured on Homepage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={form.featured}
              onCheckedChange={(checked) => setForm((prev) => ({ ...prev, featured: checked }))}
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

      {/* Ticket Tiers Card (your existing one) */}
      {/* ... */}

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
