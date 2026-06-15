"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { updateMix, getMix } from "../actions";
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

export default function EditMixPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [djs, setDjs] = useState([]);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    djId: "",
    genre: "",
    description: "",
    duration: "",
    audioUrl: "",
    coverImage: "",
    releaseDate: "",
    featured: false,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [mix, djList] = await Promise.all([
          getMix(id),
          fetch("/api/djs").then(r => r.json())
        ]);

        if (!mix) {
          toast.error("Mix not found");
          router.push("/admin/mixes");
          return;
        }

        setForm({
          title: mix.title,
          slug: mix.slug,
          djId: mix.djId,
          genre: mix.genre,
          description: mix.description || "",
          duration: mix.duration.toString(),
          audioUrl: mix.audioUrl,
          coverImage: mix.coverImage,
          releaseDate: new Date(mix.releaseDate).toISOString().slice(0, 10),
          featured: mix.featured || false,
        });
        setDjs(djList);
      } catch (error) {
        toast.error("Failed to load mix");
      } finally {
        setInitialLoading(false);
      }
    }
    loadData();
  }, [id, router]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    formData.append("featured", form.featured.toString());

    const result = await updateMix(id, formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Mix updated successfully");
      router.push("/admin/mixes");
    }
    setLoading(false);
  }

  if (initialLoading) return <div className="p-12 text-center">Loading mix...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/mixes" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <h1 className="text-3xl font-bold">Edit Mix</h1>
      </div>

      <form action={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader><CardTitle>Mix Information</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Title</Label><Input name="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div><Label>Slug</Label><Input name="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required /></div>
            </div>

            <div>
              <Label>DJ</Label>
              <Select name="djId" defaultValue={form.djId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select DJ" />
                </SelectTrigger>
                <SelectContent>
                  {djs.map((dj: any) => (
                    <SelectItem key={dj._id} value={dj._id}>
                      {dj.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div><Label>Genre</Label><Input name="genre" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} required /></div>

            <div><Label>Description</Label><Textarea name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} /></div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Duration (minutes)</Label><Input name="duration" type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} required /></div>
              <div><Label>Release Date</Label><Input name="releaseDate" type="date" value={form.releaseDate} onChange={(e) => setForm({ ...form, releaseDate: e.target.value })} required /></div>
            </div>

            <div>
              <Label>Audio URL (relative or full)</Label>
              <Input name="audioUrl" value={form.audioUrl} onChange={(e) => setForm({ ...form, audioUrl: e.target.value })} required />
            </div>

            <div>
              <Label>Cover Image URL (relative or full)</Label>
              <Input name="coverImage" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} required />
            </div>
          </CardContent>
        </Card>

        {/* Featured */}
        <Card>
          <CardHeader><CardTitle>Featured on Homepage</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Switch checked={form.featured} onCheckedChange={(checked) => setForm({ ...form, featured: checked })} />
              <Label>Feature this mix on homepage</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/mixes">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Mix"}
          </Button>
        </div>
      </form>
    </div>
  );
}
