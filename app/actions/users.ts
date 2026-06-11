"use server";

import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User"; // Adjust path if needed
import { revalidatePath } from "next/cache";
import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  role: z.enum(["admin", "user", "moderator"]),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  isActive: z.boolean().default(true),
});

export async function getUsers() {
  try {
    await dbConnect();
    const users = await User.find().select("-password").lean();
    return users.map((u: any) => ({ ...u, id: u._id.toString() }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getUser(id: string) {
  try {
    await dbConnect();
    const user = await User.findById(id).select("-password").lean();
    if (!user) return null;
    return { ...user, id: user._id.toString() };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function deleteUser(id: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  try {
    await dbConnect();
    await User.findByIdAndDelete(id);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete user" };
  }
}

export async function createUser(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    password: formData.get("password"),
    isActive: formData.get("isActive") === "true",
  };

  const result = userSchema.safeParse(rawData);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  try {
    await dbConnect();
    const existingUser = await User.findOne({ email: result.data.email });
    if (existingUser) return { error: "User with this email already exists" };

    await User.create(result.data);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create user" };
  }
}

export async function updateUser(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    isActive: formData.get("isActive") === "true",
    // Password is optional on update
    ...(formData.get("password") && { password: formData.get("password") }),
  };

  const result = userSchema.partial().safeParse(rawData);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  try {
    await dbConnect();
    const existingUser = await User.findOne({
      email: result.data.email,
      _id: { $ne: id },
    });
    if (existingUser) return { error: "Email already in use" };

    await User.findByIdAndUpdate(id, result.data);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update user" };
  }
}
