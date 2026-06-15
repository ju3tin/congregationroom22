"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { updateMix, getMix } from "@/app/actions/mixes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditMixPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

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

  // Load mix data using getMix
  useEffect(() => {
    async function loadMix() {
      try {
        const mix = await getMix(id);
        
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
      } catch (error) {
        toast.error("Failed to load mix");
      } finally {
        setInitialLoading(false);
      }
    }

    loadMix();
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

  if (initialLoading) {
    return <div className="p-12 text-center">Loading mix...</div>;
  }

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
              <div>
                <Label>Title</Label>
                <Input 
                  name="title" 
                  value={form.title} 
                  onChange={(e) => setForm({ ...form, title: e.target.value })} 
                  required 
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input 
                  name="slug" 
                  value={form.slug} 
                  onChange={(e) => setForm({ ...form, slug: e.target.value })} 
                  required 
                />
              </div>
            </div>

            <div>
              <Label>DJ ID</Label>
              <Input 
                name="djId" 
                value={form.djId} 
                onChange={(e) => setForm({ ...form, djId: e.target.value })} 
                required 
              />
            </div>

            <div>
              <Label>Genre</Label>
              <Input 
                name="genre" 
                value={form.genre} 
                onChange={(e) => setForm({ ...form, genre: e.target.value })} 
                required 
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea 
                name="description" 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                rows={4} 
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Duration (minutes)</Label>
                <Input 
                  name="duration" 
                  type="number" 
                  value={form.duration} 
                  onChange={(e) => setForm({ ...form, duration: e.target.value })} 
                  required 
                />
              </div>
              <div>
                <Label>Release Date</Label>
                <Input 
                  name="releaseDate" 
                  type="date" 
                  value={form.releaseDate} 
                  onChange={(e) => setForm({ ...form, releaseDate: e.target.value })} 
                  required 
                />
              </div>
            </div>

            <div>
              <Label>Audio URL</Label>
              <Input 
                name="audioUrl" 
                type="url" 
                value={form.audioUrl} 
                onChange={(e) => setForm({ ...form, audioUrl: e.target.value })} 
                required 
              />
            </div>

            <div>
              <Label>Cover Image URL</Label>
              <Input 
                name="coverImage" 
                type="url" 
                value={form.coverImage} 
                onChange={(e) => setForm({ ...form, coverImage: e.target.value })} 
                required 
              />
            </div>
          </CardContent>
        </Card>

        {/* Featured Section */}
        <Card>
          <CardHeader><CardTitle>Featured on Homepage</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch
                checked={form.featured}
                onCheckedChange={(checked) => setForm({ ...form, featured: checked })}
              />
              <div>
                <Label className="text-base">Mark as Featured Mix</Label>
                <p className="text-sm text-muted-foreground">
                  This mix will appear in the Featured Mixes section on the front page
                </p>
              </div>
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
