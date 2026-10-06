"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  updateSlideshow,
  getSlideshow,
  deleteSlideshow,
} from "@/app/actions/slideshows";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Slide {
  title: string;
  content: string;
  timer: number;
  image?: string;
  background?: string;
  transition?: string;
  notes?: string;
}

export default function EditSlideshowPage() {
  const router = useRouter();
  const params = useParams();

  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    theme: "black",
    isPublic: true,
    featured: false,
  });

  const [slides, setSlides] = useState<Slide[]>([
    {
      title: "",
      content: "",
      timer: 0,
      image: "",
      background: "",
      transition: "fade",
      notes: "",
    },
  ]);

  useEffect(() => {
    async function loadSlideshow() {
      try {
        const data = await getSlideshow(id);

        if (!data) {
          toast.error("Slideshow not found");
          router.push("/admin/slideshows");
          return;
        }

        setForm({
          title: data.title,
          slug: data.slug,
          description: data.description || "",
          theme: data.theme || "black",
          isPublic: data.isPublic ?? true,
          featured: data.featured ?? false,
        });

        setSlides(
          data.slides?.map((slide: any) => ({
            title: slide.title || "",
            content: slide.content || "",
            timer: slide.timer || 0,
            image: slide.image || "",
            background: slide.background || "",
            transition: slide.transition || "fade",
            notes: slide.notes || "",
          })) || [
            {
              title: "",
              content: "",
              timer: 0,
              image: "",
              background: "",
              transition: "fade",
              notes: "",
            },
          ]
        );

        setInitialLoading(false);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load slideshow");
        router.push("/admin/slideshows");
      }
    }

    loadSlideshow();
  }, [id, router]);

  const addSlide = () => {
    setSlides([
      ...slides,
      {
        title: "",
        content: "",
        timer: 0,
        image: "",
        background: "",
        transition: "fade",
        notes: "",
      },
    ]);
  };

  const removeSlide = (index: number) => {
    if (slides.length > 1) {
      setSlides(slides.filter((_, i) => i !== index));
    }
  };

  const updateSlide = (
    index: number,
    field: keyof Slide,
    value: string | number
  ) => {
    const updated = [...slides];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setSlides(updated);
  };

  async function handleSubmit(formData: FormData) {
    setLoading(true);

    formData.append("slides", JSON.stringify(slides));

    const result = await updateSlideshow(id, formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Slideshow updated successfully");
      router.push("/admin/slideshows");
    }

    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this slideshow?")) {
      return;
    }

    setDeleting(true);

    const result = await deleteSlideshow(id);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Slideshow deleted");
      router.push("/admin/slideshows");
    }

    setDeleting(false);
  }

  if (initialLoading) {
    return (
      <div className="p-12 text-center">
        Loading...
      </div>
    );
  }

  return (
    <form
      action={handleSubmit}
      className="mx-auto max-w-4xl space-y-8 p-6"
    >
      {/* Header */}

      <div className="flex items-center gap-4">
        <Link
          href="/admin/slideshows"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <h1 className="text-3xl font-bold">
          Edit Slideshow
        </h1>
      </div>

      {/* Slideshow Info */}

      <Card>
        <CardHeader>
          <CardTitle>
            Slideshow Info
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">

          <div className="grid gap-4 sm:grid-cols-2">

            <div className="space-y-2">
              <Label>
                Title
              </Label>

              <Input
                name="title"
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>
                Slug
              </Label>

              <Input
                name="slug"
                value={form.slug}
                onChange={(e) =>
                  setForm({
                    ...form,
                    slug: e.target.value,
                  })
                }
                required
              />
            </div>

          </div>

          <div className="space-y-2">
            <Label>
              Description
            </Label>

            <Textarea
              name="description"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
            />
          </div>

          {/* Theme */}

          <div className="space-y-2">
            <Label>
              Theme
            </Label>

            <Input
              name="theme"
              value={form.theme}
              onChange={(e) =>
                setForm({
                  ...form,
                  theme: e.target.value,
                })
              }
            />
          </div>

          {/* Public / Featured */}

          <div className="grid gap-6 border-t pt-6 sm:grid-cols-2">

            <div className="flex items-center justify-between rounded-lg border p-4">

              <div>
                <Label className="text-base">
                  Public
                </Label>

                <p className="text-sm text-muted-foreground">
                  Allow this slideshow to be displayed publicly.
                </p>
              </div>

              <Switch
  checked={form.isPublic}
  onCheckedChange={async (checked) => {
    // Update UI immediately
    setForm((prev) => ({
      ...prev,
      isPublic: checked,
    }));

    try {
      const response = await fetch(
        `/api/slideshows/${id}/visibility`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isPublic: checked,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to update visibility"
        );
      }

      console.log("Visibility saved:", data);

      toast.success(
        checked
          ? "Slideshow is now public"
          : "Slideshow is now private"
      );
    } catch (error) {
      console.error(error);

      // Revert UI if database update failed
      setForm((prev) => ({
        ...prev,
        isPublic: !checked,
      }));

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update visibility"
      );
    }
  }}
/>

              <input
                type="hidden"
                name="isPublic"
                value={form.isPublic ? "true" : "false"}
              />

            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">

              <div>
                <Label className="text-base">
                  Featured
                </Label>

                <p className="text-sm text-muted-foreground">
                  Mark this slideshow as featured.
                </p>
              </div>

              <Switch
                checked={form.featured}
                onCheckedChange={(checked) =>
                  setForm({
                    ...form,
                    featured: checked,
                  })
                }
                name="featured"
              />

              <input
                type="hidden"
                name="featured"
                value={form.featured ? "true" : "false"}
              />

            </div>

          </div>

        </CardContent>
      </Card>

      {/* Slides */}

      <Card>

        <CardHeader className="flex flex-row items-center justify-between">

          <CardTitle>
            Slides
          </CardTitle>

          <Button
            type="button"
            onClick={addSlide}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Slide
          </Button>

        </CardHeader>

        <CardContent className="space-y-6">

          {slides.map((slide, index) => (

            <div
              key={index}
              className="space-y-4 rounded-lg border p-4"
            >

              <div className="flex items-center justify-between">

                <h4 className="font-semibold">
                  Slide {index + 1}
                </h4>

                {slides.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeSlide(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}

              </div>

              <div className="space-y-2">

                <Label>
                  Slide Title
                </Label>

                <Input
                  placeholder="Slide Title"
                  value={slide.title}
                  onChange={(e) =>
                    updateSlide(
                      index,
                      "title",
                      e.target.value
                    )
                  }
                  required
                />

              </div>

              <div className="space-y-2">

                <Label>
                  Slide Content
                </Label>

                <Textarea
                  placeholder="Slide Content (HTML supported)"
                  value={slide.content}
                  onChange={(e) =>
                    updateSlide(
                      index,
                      "content",
                      e.target.value
                    )
                  }
                  rows={4}
                  required
                />

              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                <div className="space-y-2">

                  <Label>
                    Timer (seconds)
                  </Label>

                  <Input
                    type="number"
                    min="0"
                    value={slide.timer}
                    onChange={(e) =>
                      updateSlide(
                        index,
                        "timer",
                        parseInt(e.target.value) || 0
                      )
                    }
                  />

                  <p className="text-xs text-muted-foreground">
                    0 = use the default slideshow timing.
                  </p>

                </div>

                <div className="space-y-2">

                  <Label>
                    Transition
                  </Label>

                  <Input
                    value={slide.transition || ""}
                    placeholder="fade"
                    onChange={(e) =>
                      updateSlide(
                        index,
                        "transition",
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

              <div className="space-y-2">

                <Label>
                  Image URL
                </Label>

                <Input
                  value={slide.image || ""}
                  placeholder="/images/example.png"
                  onChange={(e) =>
                    updateSlide(
                      index,
                      "image",
                      e.target.value
                    )
                  }
                />

              </div>

              {/* Image Preview */}

              {slide.image && (
                <div className="overflow-hidden rounded-lg border bg-black">

                  <img
                    src={slide.image}
                    alt={slide.title || `Slide ${index + 1}`}
                    className="max-h-64 w-full object-contain"
                  />

                </div>
              )}

              <div className="space-y-2">

                <Label>
                  Background
                </Label>

                <Input
                  value={slide.background || ""}
                  placeholder="#000000 or CSS gradient"
                  onChange={(e) =>
                    updateSlide(
                      index,
                      "background",
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="space-y-2">

                <Label>
                  Notes
                </Label>

                <Textarea
                  value={slide.notes || ""}
                  onChange={(e) =>
                    updateSlide(
                      index,
                      "notes",
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

          ))}

        </CardContent>
      </Card>

      {/* Actions */}

      <div className="flex justify-between">

        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting
            ? "Deleting..."
            : "Delete Slideshow"}
        </Button>

        <div className="flex gap-4">

          <Button
            type="button"
            variant="outline"
            asChild
          >
            <Link href="/admin/slideshows">
              Cancel
            </Link>
          </Button>

          <Button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : "Update Slideshow"}
          </Button>

        </div>

      </div>

    </form>
  );
}