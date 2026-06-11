"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
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

interface Event {
  _id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  status: "draft" | "published" | "cancelled";
  venueName: string;
  venueAddress: string;
  venueCity: string;
  date: string;
  doors: string;
  ticketTiers: TicketTier[];
  lineup: LineupItem[];
  featured: boolean;
}

interface EventFormProps {
  djs: DJOption[];
  event: Event;
  action: (formData: FormData) => Promise<{ error?: string }>;
}

export default function EventForm({ djs, event, action }: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [tiers, setTiers] = useState<TicketTier[]>(event.ticketTiers || []);
  const [lineup, setLineup] = useState<LineupItem[]>(event.lineup || []);
  const [status, setStatus] = useState(event.status || "draft");
  const [featured, setFeatured] = useState(event.featured || false);

  // ... your existing handlers (addTier, updateTier, etc.) remain the same ...

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      formData.append("id", event._id);
      formData.append("ticketTiers", JSON.stringify(tiers));
      formData.append("lineup", JSON.stringify(lineup));
      formData.append("status", status);
      formData.append("featured", featured.toString());

      const result = await action(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Event updated successfully");
        router.push("/admin/events");
        router.refresh();
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-8 max-w-5xl mx-auto p-6">
      {/* ... your existing form cards ... */}

      {/* Featured Section */}
      <Card>
        <CardHeader>
          <CardTitle>Featured on Homepage</CardTitle>
        </CardHeader>
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

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/events">Cancel</Link>
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving Changes..." : "Update Event"}
        </Button>
      </div>
    </form>
  );
}
