"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { updateDJ, deleteDJ } from "../actions";

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

interface ImageFile {
  name: string;
  url: string;
}

interface Props {
  dj: {
    _id: string;
    name: string;
    slug: string;
    genre: string;
    bio: string;
    image: string;
    featured: boolean;
    socialLinks?: {
      instagram?: string;
      soundcloud?: string;
      twitter?: string;
    };
  };
}

export default function EditDJForm({ dj }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [isFeatured, setIsFeatured] = useState(dj.featured);

  // Image state
  const [image, setImage] = useState(dj.image || "");
  const [imageMode, setImageMode] = useState<"library" | "external">(
    dj.image?.includes("/api/images/") ? "library" : "external"
  );

  const [images, setImages] = useState<ImageFile[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);

  // Load images from GitHub through your API
  useEffect(() => {
    async function loadImages() {
      try {
        setLoadingImages(true);

        const response = await fetch("/api/files");

        if (!response.ok) {
          throw new Error("Failed to load images");
        }

        const data = await response.json();

        setImages(data);
      } catch (error) {
        console.error(error);
        toast.error("Could not load images");
      } finally {
        setLoadingImages(false);
      }
    }

    loadImages();
  }, []);

  async function handleSubmit(formData: FormData) {
    setLoading(true);

    // Make sure selected image is submitted
    formData.set("image", image);

    formData.append("featured", isFeatured.toString());

    const result = await updateDJ(dj._id, formData);

    if (result.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success("DJ updated successfully");
      router.refresh();
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this DJ?")) {
      return;
    }

    setDeleting(true);

    const result = await deleteDJ(dj._id);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("DJ deleted");
      router.push("/admin/djs");
    }

    setDeleting(false);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/djs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <h1 className="text-3xl font-bold">Edit DJ</h1>
      </div>

      <form action={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>DJ Information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  name="name"
                  defaultValue={dj.name}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  name="slug"
                  defaultValue={dj.slug}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Genre</Label>
              <Input
                name="genre"
                defaultValue={dj.genre}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Biography</Label>
              <Textarea
                name="bio"
                rows={6}
                defaultValue={dj.bio}
                required
              />
            </div>

            {/* ==================== IMAGE SECTION ==================== */}

            <div className="space-y-4">
              <Label>DJ Image</Label>

              {/* Image mode buttons */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={imageMode === "library" ? "default" : "outline"}
                  onClick={() => setImageMode("library")}
                >
                  Choose Image
                </Button>

                <Button
                  type="button"
                  variant={imageMode === "external" ? "default" : "outline"}
                  onClick={() => setImageMode("external")}
                >
                  External URL
                </Button>
              </div>

              {/* GitHub image library */}
              {imageMode === "library" && (
                <div className="space-y-3">
                  {loadingImages ? (
                    <p className="text-sm text-muted-foreground">
                      Loading images...
                    </p>
                  ) : images.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No images found.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                      {images.map((file) => {
                        const selected = image === file.url;

                        return (
                          <button
                            key={file.name}
                            type="button"
                            onClick={() => setImage(file.url)}
                            className={`group overflow-hidden rounded-lg border-2 text-left transition ${
                              selected
                                ? "border-primary ring-2 ring-primary/30"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div className="aspect-square overflow-hidden bg-muted">
                              <img
                                src={file.url}
                                alt={file.name}
                                className="h-full w-full object-cover transition group-hover:scale-105"
                              />
                            </div>

                            <div className="truncate p-2 text-xs">
                              {file.name}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* External URL */}
              {imageMode === "external" && (
                <Input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  required
                />
              )}

              {/* Selected image URL */}
              <Input
                name="image"
                type="hidden"
                value={image}
                readOnly
              />

              {/* Preview */}
              {image && (
                <div className="space-y-2">
                  <Label>Preview</Label>

                  <div className="relative aspect-video max-w-md overflow-hidden rounded-lg border bg-muted">
                    <img
                      src={image}
                      alt="Selected DJ"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>

                  <p className="break-all text-xs text-muted-foreground">
                    {image}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ==================== FEATURED SECTION ==================== */}

        <Card>
          <CardHeader>
            <CardTitle>Featured on Homepage</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch
                checked={isFeatured}
                onCheckedChange={setIsFeatured}
              />

              <div>
                <Label className="text-base">
                  Mark as Featured
                </Label>

                <p className="text-sm text-muted-foreground">
                  This DJ will appear in the featured section on the homepage
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ==================== SOCIAL LINKS ==================== */}

        <Card>
          <CardHeader>
            <CardTitle>Social Media Links</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Instagram</Label>

              <Input
                name="instagram"
                defaultValue={dj.socialLinks?.instagram || ""}
              />
            </div>

            <div className="space-y-2">
              <Label>SoundCloud</Label>

              <Input
                name="soundcloud"
                defaultValue={dj.socialLinks?.soundcloud || ""}
              />
            </div>

            <div className="space-y-2">
              <Label>Twitter / X</Label>

              <Input
                name="twitter"
                defaultValue={dj.socialLinks?.twitter || ""}
              />
            </div>
          </CardContent>
        </Card>

        {/* ==================== ACTIONS ==================== */}

        <div className="flex justify-between">
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete DJ"}
          </Button>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              asChild
            >
              <Link href="/admin/djs">
                Cancel
              </Link>
            </Button>

            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
