"use server"

import { auth } from "@/lib/auth"
import dbConnect from "@/lib/db"
import PromoCode from "@/models/PromoCode"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const promoCodeSchema = z.object({
  code: z.string().min(1, "Code is required"),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().min(0, "Discount must be positive"),
  minPurchase: z.number().min(0).optional(),
  maxUses: z.number().min(1).optional(),
  validFrom: z.string().min(1, "Start date is required"),
  validUntil: z.string().min(1, "End date is required"),
})

export async function createPromoCode(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "admin") {
    return { error: "Unauthorized" }
  }

  const rawData = {
    code: (formData.get("code") as string).toUpperCase(),
    discountType: formData.get("discountType") as string,
    discountValue: parseFloat(formData.get("discountValue") as string) || 0,
    minPurchase: formData.get("minPurchase")
      ? parseFloat(formData.get("minPurchase") as string)
      : undefined,
    maxUses: formData.get("maxUses")
      ? parseInt(formData.get("maxUses") as string)
      : undefined,
    validFrom: formData.get("validFrom") as string,
    validUntil: formData.get("validUntil") as string,
  }

  const result = promoCodeSchema.safeParse(rawData)
  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  try {
    await dbConnect()

    const existingCode = await PromoCode.findOne({ code: result.data.code })
    if (existingCode) {
      return { error: "A promo code with this name already exists" }
    }

    await PromoCode.create({
      ...result.data,
      validFrom: new Date(result.data.validFrom),
      validUntil: new Date(result.data.validUntil),
      usedCount: 0,
    })

    revalidatePath("/admin/promo-codes")
    return { success: true }
  } catch (error) {
    console.error("Create promo code error:", error)
    return { error: "Failed to create promo code" }
  }
}
