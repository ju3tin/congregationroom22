"use server";

import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const variantSchema = z.object({
  name: z.string().min(1, "Variant name is required"),
  sku: z.string().min(1, "SKU is required"),
  price: z.number().min(0, "Price must be positive"),
  stock: z.number().min(0, "Stock must be positive"),
});

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  status: z.enum(["active", "draft", "archived"]),
  variants: z.array(variantSchema).min(1, "At least one variant is required"),
});

export async function createProduct(formData: FormData) {
  console.log("=== createProduct started ===");

  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    console.log("Unauthorized");
    return { error: "Unauthorized" };
  }

  const imagesJson = formData.get("images") as string;
  const variantsJson = formData.get("variants") as string;

  let images: string[] = [];
  let variants: any[] = [];

  try {
    images = imagesJson ? JSON.parse(imagesJson) : [];
    variants = variantsJson ? JSON.parse(variantsJson) : [];
    console.log("Parsed images:", images.length);
    console.log("Parsed variants:", variants.length);
  } catch (e) {
    console.error("JSON parse error:", e);
    return { error: "Invalid images or variants format" };
  }

  const rawData = {
    name: formData.get("name") as string,
    slug: (formData.get("slug") as string)?.toLowerCase().trim().replace(/\s+/g, "-"),
    description: formData.get("description") as string,
    category: formData.get("category") as string,
    images: images.filter(Boolean),
    status: (formData.get("status") as string) || "draft",
    variants,
  };

  console.log("Raw data prepared:", rawData);

  const result = productSchema.safeParse(rawData);
  if (!result.success) {
    console.error("Validation error:", result.error.errors);
    return { error: result.error.errors[0].message };
  }

  try {
    await dbConnect();

    const existingProduct = await Product.findOne({ slug: result.data.slug });
    if (existingProduct) {
      return { error: "A product with this slug already exists" };
    }

    const newProduct = await Product.create(result.data);
    console.log("Product created successfully with ID:", newProduct._id);

    revalidatePath("/admin/products");
    revalidatePath("/products");

    return { success: true };
  } catch (error) {
    console.error("Create product error:", error);
    return { error: "Failed to create product. Check server logs." };
  }
}

export async function updateProduct(productId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const imagesJson = formData.get("images") as string;
  const variantsJson = formData.get("variants") as string;

  let images: string[] = [];
  let variants: any[] = [];

  try {
    images = imagesJson ? JSON.parse(imagesJson) : [];
    variants = variantsJson ? JSON.parse(variantsJson) : [];
  } catch {
    return { error: "Invalid images or variants format" };
  }

  const rawData = {
    name: formData.get("name") as string,
    slug: (formData.get("slug") as string)?.toLowerCase().trim().replace(/\s+/g, "-"),
    description: formData.get("description") as string,
    category: formData.get("category") as string,
    images: images.filter(Boolean),
    status: (formData.get("status") as string) || "draft",
    variants,
  };

  const result = productSchema.safeParse(rawData);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  try {
    await dbConnect();

    const existingProduct = await Product.findOne({
      slug: result.data.slug,
      _id: { $ne: productId },
    });
    if (existingProduct) {
      return { error: "A product with this slug already exists" };
    }

    await Product.findByIdAndUpdate(productId, result.data);

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(`/products/${result.data.slug}`);
    return { success: true };
  } catch (error) {
    console.error("Update product error:", error);
    return { error: "Failed to update product" };
  }
}

export async function deleteProduct(productId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  try {
    await dbConnect();
    await Product.findByIdAndDelete(productId);
    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Delete product error:", error);
    return { error: "Failed to delete product" };
  }
}

export async function getProducts() {
  try {
    await dbConnect();
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    return products.map((p: any) => ({
      ...p,
      _id: p._id.toString(),
    }));
  } catch (error) {
    console.error("Get products error:", error);
    return [];
  }
}
