"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { updateEvent } from "@/app/actions/events";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    venueName: "",
    venueAddress: "",
    venueCity: "",
    date: "",
    doors: "",
    image: "",
    status: "draft" as "draft" | "published" | "cancelled",
    featured: false,
  });

  useEffect(() => {
    async function loadEvent() {
      try {
        const res = await fetch(`/api/events/${id}`);
        const event = await res.json();

        setForm({
          title: event.title,
          slug: event.slug,
          description: event.description,
          venueName: event.venue.name,
          venueAddress: event.venue.address,
          venueCity: event.venue.city,
          date: new Date(event.date).toISOString().slice(0, 16),
          doors: new Date(event.doors).toISOString().slice(0, 16),
          image: event.image,
          status: event.status,
          featured: event.featured || false,
        });
      } catch (err) {
        toast.error("Failed to load event");
      } finally {
        setInitialLoading(false);
      }
    }
    loadEvent();
  }, [id]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    formData.append("featured", form.featured.toString());

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
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/events" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <h1 className="text-3xl font-bold">Edit Event</h1>
      </div>

      <form action={handleSubmit} className="space-y-8">
        {/* Basic Info, Venue, Date, etc. - Add your full form here */}

        {/* Featured */}
        <Card>
          <CardHeader><CardTitle>Featured on Homepage</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
              <Label>Mark as Featured Event</Label>
            </div>
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
    </div>
  );
}
