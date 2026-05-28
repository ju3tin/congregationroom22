"use server"

import { auth } from "@/lib/auth"
import dbConnect from "@/lib/db"
import Product from "@/models/Product"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const variantSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  price: z.number().min(0),
  stock: z.number().min(0),
})

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  status: z.enum(["active", "draft", "archived"]),
  variants: z.array(variantSchema).min(1, "At least one variant is required"),
})

export async function createProduct(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "admin") {
    return { error: "Unauthorized" }
  }

  const variantsJson = formData.get("variants") as string
  const imagesJson = formData.get("images") as string
  
  let variants, images
  try {
    variants = JSON.parse(variantsJson)
    images = JSON.parse(imagesJson)
  } catch {
    return { error: "Invalid data format" }
  }

  const rawData = {
    name: formData.get("name") as string,
    slug: (formData.get("slug") as string).toLowerCase().replace(/\s+/g, "-"),
    description: formData.get("description") as string,
    category: formData.get("category") as string,
    status: formData.get("status") as string,
    images,
    variants,
  }

  const result = productSchema.safeParse(rawData)
  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  try {
    await dbConnect()

    const existingProduct = await Product.findOne({ slug: result.data.slug })
    if (existingProduct) {
      return { error: "A product with this slug already exists" }
    }

    await Product.create(result.data)

    revalidatePath("/admin/products")
    revalidatePath("/merch")
    return { success: true }
  } catch (error) {
    console.error("Create product error:", error)
    return { error: "Failed to create product" }
  }
}

export async function updateProduct(productId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "admin") {
    return { error: "Unauthorized" }
  }

  const variantsJson = formData.get("variants") as string
  const imagesJson = formData.get("images") as string
  
  let variants, images
  try {
    variants = JSON.parse(variantsJson)
    images = JSON.parse(imagesJson)
  } catch {
    return { error: "Invalid data format" }
  }

  const rawData = {
    name: formData.get("name") as string,
    slug: (formData.get("slug") as string).toLowerCase().replace(/\s+/g, "-"),
    description: formData.get("description") as string,
    category: formData.get("category") as string,
    status: formData.get("status") as string,
    images,
    variants,
  }

  const result = productSchema.safeParse(rawData)
  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  try {
    await dbConnect()

    const existingProduct = await Product.findOne({
      slug: result.data.slug,
      _id: { $ne: productId },
    })
    if (existingProduct) {
      return { error: "A product with this slug already exists" }
    }

    await Product.findByIdAndUpdate(productId, result.data)

    revalidatePath("/admin/products")
    revalidatePath("/merch")
    revalidatePath(`/merch/${result.data.slug}`)
    return { success: true }
  } catch (error) {
    console.error("Update product error:", error)
    return { error: "Failed to update product" }
  }
}

export async function deleteProduct(productId: string) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "admin") {
    return { error: "Unauthorized" }
  }

  try {
    await dbConnect()
    await Product.findByIdAndDelete(productId)

    revalidatePath("/admin/products")
    revalidatePath("/merch")
    return { success: true }
  } catch (error) {
    console.error("Delete product error:", error)
    return { error: "Failed to delete product" }
  }
}
