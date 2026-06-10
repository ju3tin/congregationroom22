"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateProduct, getProduct } from "@/app/(admin)/admin/products/actions";
import { toast } from "sonner";

interface Variant {
  name: string;
  sku: string;
  price: number;
  stock: number;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Form fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<"draft" | "active" | "archived">("draft");

  const [images, setImages] = useState<string[]>([""]);
  const [variants, setVariants] = useState<Variant[]>([
    { name: "", sku: "", price: 0, stock: 0 },
  ]);

  // Fetch product
  useEffect(() => {
    async function fetchProduct() {
      if (!productId) return;

      try {
        const product = await getProduct(productId);
        if (!product) {
          toast.error("Product not found");
          router.push("/admin/products");
          return;
        }

        setName(product.name);
        setSlug(product.slug);
        setDescription(product.description || "");
        setCategory(product.category || "");
        setStatus(product.status);

        setImages(product.images?.length > 0 ? [...product.images] : [""]);
        setVariants(
          product.variants?.length > 0
            ? [...product.variants]
            : [{ name: "Default", sku: "", price: 0, stock: 0 }]
        );
      } catch (error) {
        toast.error("Failed to load product");
      } finally {
        setInitialLoading(false);
      }
    }

    fetchProduct();
  }, [productId, router]);

  // Image handlers
  const addImage = () => setImages([...images, ""]);
  const removeImage = (index: number) => {
    if (images.length > 1) setImages(images.filter((_, i) => i !== index));
  };
  const updateImage = (index: number, value: string) => {
    const updated = [...images];
    updated[index] = value;
    setImages(updated);
  };

  // Variant handlers
  const addVariant = () => {
    setVariants([...variants, { name: "", sku: "", price: 0, stock: 0 }]);
  };
  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };
  const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);

    formData.append("images", JSON.stringify(images.filter((i) => i.trim())));
    formData.append("variants", JSON.stringify(variants));

    const result = await updateProduct(productId, formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Product updated successfully");
      router.push("/admin/products");
    }
    setLoading(false);
  };

  if (initialLoading) {
    return <div className="p-8 text-center">Loading product...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-3xl font-bold">Edit Product</h1>
      </div>

      <form action={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  name="status"
                  value={status}
                  onValueChange={(value: "draft" | "active" | "archived") => setStatus(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Images</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addImage}>
              <Plus className="mr-2 h-4 w-4" />
              Add Image
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {images.map((image, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={image}
                  onChange={(e) => updateImage(index, e.target.value)}
                  placeholder="https://..."
                  type="url"
                />
                {images.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeImage(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Variants */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Variants</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addVariant}>
              <Plus className="mr-2 h-4 w-4" />
              Add Variant
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {variants.map((variant, index) => (
              <div key={index} className="rounded-lg border border-border p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Variant {index + 1}</h4>
                  {variants.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeVariant(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Variant Name</Label>
                    <Input
                      value={variant.name}
                      onChange={(e) => updateVariant(index, "name", e.target.value)}
                      placeholder="Small, Medium, Large..."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SKU</Label>
                    <Input
                      value={variant.sku}
                      onChange={(e) => updateVariant(index, "sku", e.target.value)}
                      placeholder="PROD-001-SM"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Price ($)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.price}
                      onChange={(e) => updateVariant(index, "price", parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stock</Label>
                    <Input
                      type="number"
                      min="0"
                      value={variant.stock}
                      onChange={(e) => updateVariant(index, "stock", parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/products">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
