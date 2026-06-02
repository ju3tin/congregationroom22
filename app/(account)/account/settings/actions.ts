"use server"

import bcrypt from "bcryptjs"
import { auth } from "@/lib/auth"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import { z } from "zod"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export async function updateProfile(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
  }

  const result = profileSchema.safeParse(rawData)
  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  try {
    await dbConnect()

    // Check if email is already taken by another user
    const existingUser = await User.findOne({
      email: result.data.email.toLowerCase(),
      _id: { $ne: session.user.id },
    })

    if (existingUser) {
      return { error: "Email is already in use" }
    }

    await User.findByIdAndUpdate(session.user.id, {
      name: result.data.name,
      email: result.data.email.toLowerCase(),
    })

    return { success: true }
  } catch (error) {
    console.error("Update profile error:", error)
    return { error: "Failed to update profile" }
  }
}

export async function updatePassword(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const rawData = {
    currentPassword: formData.get("currentPassword") as string,
    newPassword: formData.get("newPassword") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  }

  const result = passwordSchema.safeParse(rawData)
  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  try {
    await dbConnect()

    const user = await User.findById(session.user.id)
    if (!user) {
      return { error: "User not found" }
    }

    const isPasswordValid = await bcrypt.compare(
      result.data.currentPassword,
      user.password
    )

    if (!isPasswordValid) {
      return { error: "Current password is incorrect" }
    }

    const hashedPassword = await bcrypt.hash(result.data.newPassword, 12)

    await User.findByIdAndUpdate(session.user.id, {
      password: hashedPassword,
    })

    return { success: true }
  } catch (error) {
    console.error("Update password error:", error)
    return { error: "Failed to update password" }
  }
}
