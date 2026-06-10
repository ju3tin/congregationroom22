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
import { updateTimelineEvent, getTimelineEvent } from "@/app/actions/timeline"; // ← Updated import
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

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    startDate: { year: 0, month: undefined as number | undefined, day: undefined as number | undefined },
    endDate: null as { year: number; month?: number; day?: number } | null,
    featured: false,
    sortOrder: 0,
    tags: [""] as string[],
    media: { url: "", caption: "", credit: "", thumbnail: "" },
    location: { name: "", latitude: "", longitude: "" },
    sources: [{ title: "", url: "" }] as Source[],
  });

  useEffect(() => {
    async function loadEvent() {
      try {
        const event = await getTimelineEvent(id);
        if (!event) {
          toast.error("Event not found");
          router.push("/admin/timeline");
          return;
        }

        setForm({
          title: event.title,
          description: event.description,
          category: event.category || "",
          startDate: event.startDate,
          endDate: event.endDate || null,
          featured: event.featured || false,
          sortOrder: event.sortOrder || 0,
          tags: event.tags?.length > 0 ? [...event.tags] : [""],
          media: event.media || { url: "", caption: "", credit: "", thumbnail: "" },
          location: {
            name: event.location?.name || "",
            latitude: event.location?.latitude?.toString() || "",
            longitude: event.location?.longitude?.toString() || "",
          },
          sources: event.sources?.length > 0 ? [...event.sources] : [{ title: "", url: "" }],
        });
      } catch (err) {
        toast.error("Failed to load event");
      } finally {
        setInitialLoading(false);
      }
    }
    loadEvent();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("category", form.category || "");
    fd.append("startDate", JSON.stringify(form.startDate));
    if (form.endDate) fd.append("endDate", JSON.stringify(form.endDate));
    fd.append("tags", JSON.stringify(form.tags.filter(Boolean)));
    fd.append("media", JSON.stringify(form.media));
    fd.append("location", JSON.stringify({
      name: form.location.name,
      latitude: form.location.latitude ? Number(form.location.latitude) : undefined,
      longitude: form.location.longitude ? Number(form.location.longitude) : undefined,
    }));
    fd.append("sources", JSON.stringify(form.sources.filter(s => s.title?.trim())));

    fd.append("featured", form.featured.toString());
    fd.append("sortOrder", form.sortOrder.toString());

    const result = await updateTimelineEvent(id, fd);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Event updated successfully");
      router.push("/admin/timeline");
    }
    setLoading(false);
  };

  // Handlers
  const addTag = () => setForm(p => ({ ...p, tags: [...p.tags, ""] }));
  const updateTag = (i: number, v: string) => {
    const t = [...form.tags]; t[i] = v; setForm(p => ({ ...p, tags: t }));
  };
  const removeTag = (i: number) => {
    if (form.tags.length > 1) setForm(p => ({ ...p, tags: p.tags.filter((_, idx) => idx !== i) }));
  };

  const addSource = () => setForm(p => ({ ...p, sources: [...p.sources, { title: "", url: "" }] }));
  const updateSource = (i: number, field: "title" | "url", v: string) => {
    const s = [...form.sources]; s[i] = { ...s[i], [field]: v }; setForm(p => ({ ...p, sources: s }));
  };
  const removeSource = (i: number) => {
    if (form.sources.length > 1) setForm(p => ({ ...p, sources: p.sources.filter((_, idx) => idx !== i) }));
  };

  if (initialLoading) return <div className="p-12 text-center">Loading event...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/timeline" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <h1 className="text-3xl font-bold">Edit Timeline Event</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info, Dates, Media, Location, Tags, Sources Cards — same as before */}
        {/* (All cards from previous full edit page) */}

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
