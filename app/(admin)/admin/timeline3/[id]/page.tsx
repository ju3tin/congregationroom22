"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { updateTimelineEvent, getTimelineEvent } from "@/app/actions";
import { toast } from "sonner";

interface Source {
  title: string;
  url: string;
}

export default function EditTimelineEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([""]);
  const [featured, setFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);

  const [startDate, setStartDate] = useState({ year: 0, month: 1, day: 1 });
  const [endDate, setEndDate] = useState<{ year: number; month?: number; day?: number } | null>(null);

  const [media, setMedia] = useState({ url: "", caption: "", credit: "", thumbnail: "" });
  const [location, setLocation] = useState({ name: "", latitude: "", longitude: "" });
  const [sources, setSources] = useState<Source[]>([{ title: "", url: "" }]);

  useEffect(() => {
    async function fetchEvent() {
      const event = await getTimelineEvent(id);
      if (!event) {
        toast.error("Event not found");
        router.push("/admin/timeline");
        return;
      }

      setTitle(event.title);
      setDescription(event.description);
      setCategory(event.category || "");
      setTags(event.tags?.length ? event.tags : [""]);
      setFeatured(event.featured || false);
      setSortOrder(event.sortOrder || 0);

      setStartDate(event.startDate);
      setEndDate(event.endDate || null);

      if (event.media) setMedia(event.media);
      if (event.location) setLocation({
        name: event.location.name || "",
        latitude: event.location.latitude?.toString() || "",
        longitude: event.location.longitude?.toString() || ""
      });
      if (event.sources?.length) setSources(event.sources);

      setInitialLoading(false);
    }
    fetchEvent();
  }, [id, router]);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);

    formData.append("startDate", JSON.stringify(startDate));
    if (endDate) formData.append("endDate", JSON.stringify(endDate));
    formData.append("tags", JSON.stringify(tags.filter(t => t.trim())));
    formData.append("media", JSON.stringify(media));
    formData.append("location", JSON.stringify({
      name: location.name,
      latitude: location.latitude ? Number(location.latitude) : undefined,
      longitude: location.longitude ? Number(location.longitude) : undefined,
    }));
    formData.append("sources", JSON.stringify(sources.filter(s => s.title && s.url)));

    const result = await updateTimelineEvent(id, formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Event updated successfully");
      router.push("/admin/timeline");
    }
    setLoading(false);
  };

  if (initialLoading) return <div className="p-8">Loading event...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/timeline" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <h1 className="text-3xl font-bold">Edit Timeline Event</h1>
      </div>

      <form action={handleSubmit} className="space-y-8">
        {/* Same form fields as New Event — just with pre-filled values */}
        {/* You can copy the Card sections from the New page above */}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/timeline">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Event"}
          </Button>
        </div>
      </form>
    </div>
  );
}
