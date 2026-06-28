import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await dbConnect();

    const product = await Product.findOne({ 
      slug: params.slug 
    }).lean();

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" }, 
        { status: 404 }
      );
    }

    return NextResponse.json({
      _id: product._id.toString(),
      name: product.name,
      slug: product.slug,
      description: product.description,
      images: product.images || [],
      category: product.category,
      variants: product.variants || [],
      status: product.status,
    });
  } catch (error) {
    console.error("Product API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" }, 
      { status: 500 }
    );
  }
}
