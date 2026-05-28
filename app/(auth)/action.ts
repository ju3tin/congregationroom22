"use server"

import bcrypt from "bcryptjs"
import { signIn } from "@/lib/auth"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import { z } from "zod"
import { AuthError } from "next-auth"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export async function register(formData: FormData) {
  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const result = registerSchema.safeParse(rawData)
  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  const { name, email, password } = result.data

  try {
    await dbConnect()

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return { error: "An account with this email already exists" }
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "customer",
    })

    // Sign in the user after registration
    await signIn("credentials", {
      email: email.toLowerCase(),
      password,
      redirect: false,
    })

    return { success: true }
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "Something went wrong. Please try again." }
  }
}

export async function login(formData: FormData) {
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const result = loginSchema.safeParse(rawData)
  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  try {
    await signIn("credentials", {
      email: rawData.email.toLowerCase(),
      password: rawData.password,
      redirect: false,
    })

    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" }
        default:
          return { error: "Something went wrong. Please try again." }
      }
    }
    throw error
  }
}