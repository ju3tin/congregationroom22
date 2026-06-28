import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({ status: "active" })
      .sort({ createdAt: -1 })
      .lean();

    const formatted = products.map((p: any) => ({
      _id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      description: p.description,
      images: p.images,
      variants: p.variants,
      status: p.status,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Products API Error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
