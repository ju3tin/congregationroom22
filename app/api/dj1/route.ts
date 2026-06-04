import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import DJ from "@/models/DJ";

export async function GET() {
  try {
    await dbConnect();
    const djs = await DJ.find().sort({ name: 1 }).lean();

    return NextResponse.json(djs);   // ← Return array directly (matches your current response)
  } catch (error) {
    console.error("DJ API error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
