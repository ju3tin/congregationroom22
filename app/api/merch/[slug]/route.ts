import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();

    const { slug } = await params;

    const product = await Product.findOne({
      slug,
//      status: "active",
    }).lean();

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        product: {
          _id: String(product._id),
          name: product.name,
          slug: product.slug,
          description: product.description,
          images: product.images ?? [],
          category: product.category,
          variants: product.variants ?? [],
          status: product.status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET Product Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
