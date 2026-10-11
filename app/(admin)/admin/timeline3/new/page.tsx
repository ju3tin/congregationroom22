"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { createTimelineEvent } from "@/app/actions";
import { toast } from "sonner";

interface Source {
  title: string;
  url: string;
}

export default function NewTimelineEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    startDate: { year: new Date().getFullYear(), month: undefined as number | undefined, day: undefined as number | undefined },
    background: { color: "", url: "" },
    endDate: null as { year: number; month?: number; day?: number } | null,
    featured: false,
    sortOrder: 0,
    tags: [""] as string[],
    media: { url: "", caption: "", credit: "", thumbnail: "" },
    location: { name: "", latitude: "", longitude: "" },
    sources: [{ title: "", url: "" }] as Source[],
  });

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
    fd.append("sources", JSON.stringify(form.sources.filter(s => s.title.trim())));
    fd.append("featured", form.featured.toString());
    fd.append("sortOrder", form.sortOrder.toString());
    fd.append("background", JSON.stringify(form.background || {}));

    const result = await createTimelineEvent(fd);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Timeline event created successfully");
      router.push("/admin/timeline");
    }
    setLoading(false);
  };

  // Helper functions
  const addTag = () => setForm({ ...form, tags: [...form.tags, ""] });
  const updateTag = (index: number, value: string) => {
    const newTags = [...form.tags];
    newTags[index] = value;
    setForm({ ...form, tags: newTags });
  };
  const removeTag = (index: number) => {
    if (form.tags.length > 1) setForm({ ...form, tags: form.tags.filter((_, i) => i !== index) });
  };

  const addSource = () => setForm({ ...form, sources: [...form.sources, { title: "", url: "" }] });
  const updateSource = (index: number, field: "title" | "url", value: string) => {
    const newSources = [...form.sources];
    newSources[index] = { ...newSources[index], [field]: value };
    setForm({ ...form, sources: newSources });
  };
  const removeSource = (index: number) => {
    if (form.sources.length > 1) setForm({ ...form, sources: form.sources.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/timeline" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <h1 className="text-3xl font-bold">New Timeline Event</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <Card>
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. War, Politics, Science" />
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.featured} onCheckedChange={(checked) => setForm({ ...form, featured: checked })} />
              <Label>Featured Event</Label>
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader><CardTitle>Dates</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Start Date *</h4>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Year</Label><Input type="number" value={form.startDate.year} onChange={(e) => setForm({ ...form, startDate: { ...form.startDate, year: Number(e.target.value) } })} required /></div>
                <div><Label>Month</Label><Input type="number" min="1" max="12" value={form.startDate.month || ""} onChange={(e) => setForm({ ...form, startDate: { ...form.startDate, month: e.target.value ? Number(e.target.value) : undefined } })} /></div>
                <div><Label>Day</Label><Input type="number" min="1" max="31" value={form.startDate.day || ""} onChange={(e) => setForm({ ...form, startDate: { ...form.startDate, day: e.target.value ? Number(e.target.value) : undefined } })} /></div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">End Date (optional)</h4>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Year</Label><Input type="number" value={form.endDate?.year || ""} onChange={(e) => setForm({ ...form, endDate: { year: Number(e.target.value), month: 1, day: 1 } })} /></div>
                <div><Label>Month</Label><Input type="number" min="1" max="12" value={form.endDate?.month || ""} onChange={(e) => setForm({ ...form, endDate: form.endDate ? { ...form.endDate, month: Number(e.target.value) || undefined } : null })} /></div>
                <div><Label>Day</Label><Input type="number" min="1" max="31" value={form.endDate?.day || ""} onChange={(e) => setForm({ ...form, endDate: form.endDate ? { ...form.endDate, day: Number(e.target.value) || undefined } : null })} /></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media */}
        <Card>
          <CardHeader><CardTitle>Media</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>URL</Label><Input value={form.media.url} onChange={(e) => setForm({ ...form, media: { ...form.media, url: e.target.value } })} placeholder="https://..." /></div>
              <div><Label>Thumbnail</Label><Input value={form.media.thumbnail} onChange={(e) => setForm({ ...form, media: { ...form.media, thumbnail: e.target.value } })} /></div>
            </div>
            <div><Label>Caption</Label><Input value={form.media.caption} onChange={(e) => setForm({ ...form, media: { ...form.media, caption: e.target.value } })} /></div>
            <div><Label>Credit</Label><Input value={form.media.credit} onChange={(e) => setForm({ ...form, media: { ...form.media, credit: e.target.value } })} /></div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader><CardTitle>Location</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Location Name</Label><Input value={form.location.name} onChange={(e) => setForm({ ...form, location: { ...form.location, name: e.target.value } })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Latitude</Label><Input type="number" step="any" value={form.location.latitude} onChange={(e) => setForm({ ...form, location: { ...form.location, latitude: e.target.value } })} /></div>
              <div><Label>Longitude</Label><Input type="number" step="any" value={form.location.longitude} onChange={(e) => setForm({ ...form, location: { ...form.location, longitude: e.target.value } })} /></div>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
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

        {/* Sources */}
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
                <Input placeholder="Source Title" value={source.title} onChange={(e) => updateSource(index, "title", e.target.value)} required />
                <Input placeholder="https://..." value={source.url} onChange={(e) => updateSource(index, "url", e.target.value)} />
              </div>
            ))}
          </CardContent>
        </Card>

{/* ==================== BACKGROUND ==================== */}
<Card>
  <CardHeader>
    <CardTitle>Background (TimelineJS)</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Background Color (Hex)</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={form.background?.color || "#ffffff"}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                background: { ...p.background, color: e.target.value },
              }))
            }
          />
          <Input
            value={form.background?.color || ""}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                background: { ...p.background, color: e.target.value },
              }))
            }
            placeholder="#e6f0fa"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Background Image URL (optional)</Label>
        <Input
          type="url"
          value={form.background?.url || ""}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              background: { ...p.background, url: e.target.value },
            }))
          }
          placeholder="https://example.com/background.jpg"
        />
      </div>
    </div>

    <p className="text-xs text-muted-foreground">
      Color will be used if both are provided. Leave empty to use default.
    </p>
  </CardContent>
</Card>

        
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/timeline">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Event"}
          </Button>
        </div>
      </form>
    </div>
  );
}
