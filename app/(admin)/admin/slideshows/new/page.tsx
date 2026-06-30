"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createSlideshow } from "@/app/actions/slideshows";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewSlideshowPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    theme: "black",
    isPublic: true,
    featured: false,
  });

  const [slides, setSlides] = useState([
    { title: "", content: "", timer: 0 },
  ]);

  const addSlide = () => setSlides([...slides, { title: "", content: "", timer: 0 }]);
  const removeSlide = (index: number) => {
    if (slides.length > 1) setSlides(slides.filter((_, i) => i !== index));
  };

  const updateSlide = (index: number, field: string, value: any) => {
    const updated = [...slides];
    updated[index] = { ...updated[index], [field]: value };
    setSlides(updated);
  };

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    formData.append("slides", JSON.stringify(slides));

    const result = await createSlideshow(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Slideshow created");
      router.push("/admin/slideshows");
    }
    setLoading(false);
  }

  return (
    <form action={handleSubmit} className="space-y-8 max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/slideshows" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <h1 className="text-3xl font-bold">New Slideshow</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Slideshow Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Title</Label><Input name="title" required /></div>
            <div><Label>Slug</Label><Input name="slug" required /></div>
          </div>
          <div><Label>Description</Label><Textarea name="description" /></div>
        </CardContent>
      </Card>

      {/* Slides */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Slides</CardTitle>
          <Button type="button" onClick={addSlide}>
            <Plus className="mr-2 h-4 w-4" /> Add Slide
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {slides.map((slide, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between">
                <h4>Slide {index + 1}</h4>
                {slides.length > 1 && (
                  <Button type="button" variant="ghost" onClick={() => removeSlide(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Input
                placeholder="Slide Title"
                value={slide.title}
                onChange={(e) => updateSlide(index, "title", e.target.value)}
                required
              />
              <Textarea
                placeholder="Slide Content (HTML supported)"
                value={slide.content}
                onChange={(e) => updateSlide(index, "content", e.target.value)}
                rows={4}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Timer (seconds)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={slide.timer}
                    onChange={(e) => updateSlide(index, "timer", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Image URL (optional)</Label>
                  <Input
                    value={slide.image || ""}
                    onChange={(e) => updateSlide(index, "image", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/slideshows">Cancel</Link>
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Slideshow"}
        </Button>
      </div>
    </form>
  );
}
