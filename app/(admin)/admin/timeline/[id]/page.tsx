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
import { updateTimelineEvent, getTimelineEvent } from "@/app/actions/timeline";
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

  // Load event
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
      toast.success("Event updated successfully!");
      router.push("/admin/timeline");
    }
    setLoading(false);
  };

  // Tag Handlers
  const addTag = () => setForm(p => ({ ...p, tags: [...p.tags, ""] }));
  const updateTag = (index: number, value: string) => {
    const updated = [...form.tags];
    updated[index] = value;
    setForm(p => ({ ...p, tags: updated }));
  };
  const removeTag = (index: number) => {
    if (form.tags.length > 1) setForm(p => ({ ...p, tags: p.tags.filter((_, i) => i !== index) }));
  };

  // Source Handlers
  const addSource = () => setForm(p => ({ ...p, sources: [...p.sources, { title: "", url: "" }] }));
  const updateSource = (index: number, field: "title" | "url", value: string) => {
    const updated = [...form.sources];
    updated[index] = { ...updated[index], [field]: value };
    setForm(p => ({ ...p, sources: updated }));
  };
  const removeSource = (index: number) => {
    if (form.sources.length > 1) setForm(p => ({ ...p, sources: p.sources.filter((_, i) => i !== index) }));
  };

  if (initialLoading) return <div className="p-12 text-center">Loading event...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/timeline" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Timeline
        </Link>
        <h1 className="text-3xl font-bold">Edit Timeline Event</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ==================== BASIC INFO ==================== */}
        <Card>
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} rows={5} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={form.category} onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input type="number" value={form.sortOrder} onChange={(e) => setForm(p => ({ ...p, sortOrder: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.featured} onCheckedChange={(v) => setForm(p => ({ ...p, featured: v }))} />
              <Label>Featured Event</Label>
            </div>
          </CardContent>
        </Card>

        {/* ==================== DATES ==================== */}
        <Card>
          <CardHeader><CardTitle>Dates</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Start Date</h4>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Year</Label><Input type="number" value={form.startDate.year} onChange={(e) => setForm(p => ({ ...p, startDate: { ...p.startDate, year: Number(e.target.value) } }))} required /></div>
                <div><Label>Month</Label><Input type="number" min="1" max="12" value={form.startDate.month || ""} onChange={(e) => setForm(p => ({ ...p, startDate: { ...p.startDate, month: e.target.value ? Number(e.target.value) : undefined } }))} /></div>
                <div><Label>Day</Label><Input type="number" min="1" max="31" value={form.startDate.day || ""} onChange={(e) => setForm(p => ({ ...p, startDate: { ...p.startDate, day: e.target.value ? Number(e.target.value) : undefined } }))} /></div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">End Date (Optional)</h4>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Year</Label><Input type="number" value={form.endDate?.year || ""} onChange={(e) => setForm(p => ({ ...p, endDate: { year: Number(e.target.value), month: 1, day: 1 } }))} /></div>
                <div><Label>Month</Label><Input type="number" min="1" max="12" value={form.endDate?.month || ""} onChange={(e) => setForm(p => ({ ...p, endDate: p.endDate ? { ...p.endDate, month: Number(e.target.value) || undefined } : null }))} /></div>
                <div><Label>Day</Label><Input type="number" min="1" max="31" value={form.endDate?.day || ""} onChange={(e) => setForm(p => ({ ...p, endDate: p.endDate ? { ...p.endDate, day: Number(e.target.value) || undefined } : null }))} /></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ==================== MEDIA ==================== */}
        <Card>
          <CardHeader><CardTitle>Media</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>URL</Label><Input value={form.media.url} onChange={(e) => setForm(p => ({ ...p, media: { ...p.media, url: e.target.value } }))} placeholder="https://" /></div>
              <div><Label>Thumbnail URL</Label><Input value={form.media.thumbnail} onChange={(e) => setForm(p => ({ ...p, media: { ...p.media, thumbnail: e.target.value } }))} /></div>
            </div>
            <div><Label>Caption</Label><Input value={form.media.caption} onChange={(e) => setForm(p => ({ ...p, media: { ...p.media, caption: e.target.value } }))} /></div>
            <div><Label>Credit</Label><Input value={form.media.credit} onChange={(e) => setForm(p => ({ ...p, media: { ...p.media, credit: e.target.value } }))} /></div>
          </CardContent>
        </Card>

        {/* ==================== LOCATION ==================== */}
        <Card>
          <CardHeader><CardTitle>Location</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Location Name</Label><Input value={form.location.name} onChange={(e) => setForm(p => ({ ...p, location: { ...p.location, name: e.target.value } }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Latitude</Label><Input type="number" step="any" value={form.location.latitude} onChange={(e) => setForm(p => ({ ...p, location: { ...p.location, latitude: e.target.value } }))} /></div>
              <div><Label>Longitude</Label><Input type="number" step="any" value={form.location.longitude} onChange={(e) => setForm(p => ({ ...p, location: { ...p.location, longitude: e.target.value } }))} /></div>
            </div>
          </CardContent>
        </Card>

        {/* ==================== TAGS ==================== */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tags</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addTag}><Plus className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {form.tags.map((tag, index) => (
              <div key={index} className="flex gap-2">
                <Input value={tag} onChange={(e) => updateTag(index, e.target.value)} placeholder="e.g. WWII, Politics" />
                {form.tags.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeTag(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ==================== SOURCES ==================== */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Sources</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addSource}><Plus className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {form.sources.map((source, index) => (
              <div key={index} className="border p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <h4 className="font-medium">Source {index + 1}</h4>
                  {form.sources.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeSource(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Input placeholder="Source Title" value={source.title} onChange={(e) => updateSource(index, "title", e.target.value)} />
                <Input placeholder="https://..." value={source.url} onChange={(e) => updateSource(index, "url", e.target.value)} />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 pt-6">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/timeline">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading} size="lg">
            {loading ? "Updating..." : "Update Event"}
          </Button>
        </div>
      </form>
    </div>
  );
}
