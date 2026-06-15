"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { createMix } from "../actions";
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

interface DJOption {
  _id: string;
  name: string;
}

export default function NewMixPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [djs, setDjs] = useState<DJOption[]>([]);

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

  // Fetch DJs
  useEffect(() => {
    async function fetchDJs() {
      try {
        const res = await fetch("/api/djs");
        const data = await res.json();
        setDjs(data);
      } catch (error) {
        toast.error("Failed to load DJs");
      }
    }
    fetchDJs();
  }, []);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    formData.append("featured", form.featured.toString());

    const result = await createMix(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Mix created successfully");
      router.push("/admin/mixes");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/mixes" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <h1 className="text-3xl font-bold">Upload New Mix</h1>
      </div>

      <form action={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader><CardTitle>Mix Information</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Title</Label>
                <Input name="title" required />
              </div>
              <div>
                <Label>Slug</Label>
                <Input name="slug" required placeholder="summer-mix-2026" />
              </div>
            </div>

            <div>
              <Label>DJ</Label>
              <Select name="djId" required>
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

            <div>
              <Label>Genre</Label>
              <Input name="genre" required />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea name="description" rows={4} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Duration (minutes)</Label>
                <Input name="duration" type="number" required />
              </div>
              <div>
                <Label>Release Date</Label>
                <Input name="releaseDate" type="date" required />
              </div>
            </div>

            <div>
              <Label>Audio URL (can be relative like /music/mix.mp3)</Label>
              <Input name="audioUrl" required placeholder="/music/summer-mix.mp3" />
            </div>

            <div>
              <Label>Cover Image URL (can be relative)</Label>
              <Input name="coverImage" required placeholder="/images/covers/mix1.jpg" />
            </div>
          </CardContent>
        </Card>

        {/* Featured */}
        <Card>
          <CardHeader><CardTitle>Featured on Homepage</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.featured}
                onCheckedChange={(checked) => setForm({ ...form, featured: checked })}
              />
              <Label>Feature this mix on homepage</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/mixes">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Uploading..." : "Create Mix"}
          </Button>
        </div>
      </form>
    </div>
  );
}
