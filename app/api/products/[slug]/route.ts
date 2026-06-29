import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await dbConnect();

    console.log("Looking for product with slug:", params.slug); // Debugging

    const product = await Product.findOne({ 
      slug: params.slug 
    }).lean();

    if (!product) {
      // Show all products for debugging
      const allProducts = await Product.find().select("name slug").lean();
      return NextResponse.json({
        error: "Product not found",
        requestedSlug: params.slug,
        availableSlugs: allProducts.map(p => ({ name: p.name, slug: p.slug }))
      }, { status: 404 });
    }

    return NextResponse.json({
      _id: product._id.toString(),
      name: product.name,
      slug: product.slug,
      description: product.description,
      images: product.images || [],
      category: product.category,
      status: product.status,
      variants: product.variants || [],
    });
  } catch (error) {
    console.error("Product API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" }, 
      { status: 500 }
    );
  }
}
