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
import { updateProduct, getProduct } from "@/app/(admin)/admin/products/actions"; // ← Adjust path if needed
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

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<"draft" | "active" | "archived">("draft");

  const [images, setImages] = useState<string[]>([""]);
  const [variants, setVariants] = useState<Variant[]>([
    { name: "Default", sku: "", price: 0, stock: 0 },
  ]);

  // Fetch product
  useEffect(() => {
    async function fetchProduct() {
      if (!productId) {
        toast.error("Product ID is missing");
        return;
      }

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

  const addImage = () => setImages([...images, ""]);
  const removeImage = (index: number) => {
    if (images.length > 1) setImages(images.filter((_, i) => i !== index));
  };
  const updateImage = (index: number, value: string) => {
    const updated = [...images];
    updated[index] = value;
    setImages(updated);
  };

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

  async function handleSubmit(formData: FormData) {
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
  }

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
                <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" value={category} onChange={(e) => setCategory(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" value={status} onValueChange={(v: any) => setStatus(v)}>
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

        {/* Images & Variants sections remain the same as previous message */}
        {/* ... (Images Card and Variants Card) ... */}

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
