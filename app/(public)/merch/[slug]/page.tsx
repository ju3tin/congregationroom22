import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Package, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LivePlayer } from "@/components/live-player";

async function getProduct(slug: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    const res = await fetch(`${baseUrl}/api/merch/${slug}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();

    // If your API returns:
    // { success: true, product: {...} }
    return data.product ?? data;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await getProduct(slug);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-20 pb-16">
          <div className="max-w-md mx-auto px-4 py-20 text-center">
            <Package className="mx-auto h-16 w-16 text-muted-foreground mb-6" />

            <h1 className="text-3xl font-bold mb-3">
              Product Not Found
            </h1>

            <p className="text-muted-foreground mb-8">
              Sorry, we couldn't find that product.
            </p>

            <Link href="/products">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Shop
              </Button>
            </Link>
          </div>
        </main>

        <Footer />
        <LivePlayer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          <Link
            href="/products"
            className="inline-flex items-center gap-2 mb-8 text-sm hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </Link>

          <div className="grid gap-12 lg:grid-cols-2">

            {/* Images */}
            <div>
              <div className="relative aspect-square overflow-hidden rounded-xl border">
                <Image
                  src={product.images?.[0] || "/placeholder.jpg"}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              {product.images?.length > 1 && (
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {product.images.slice(1).map((image: string, index: number) => (
                    <div
                      key={index}
                      className="relative aspect-square overflow-hidden rounded-lg border"
                    >
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div>

              <h1 className="text-4xl font-bold">
                {product.name}
              </h1>

              <p className="mt-4 text-3xl font-bold text-primary">
                £{product.variants?.[0]?.price?.toFixed(2) ?? "0.00"}
              </p>

              <p className="mt-6 text-muted-foreground">
                {product.description}
              </p>

              {product.variants?.length > 0 && (
                <div className="mt-8">
                  <h2 className="mb-4 text-lg font-semibold">
                    Available Variants
                  </h2>

                  <div className="space-y-3">
                    {product.variants.map((variant: any) => (
                      <Card key={variant.sku} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{variant.name}</p>
                            <p className="text-sm text-muted-foreground">
                              SKU: {variant.sku}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-semibold">
                              £{variant.price.toFixed(2)}
                            </p>

                            <p className="text-sm text-green-600">
                              {variant.stock} in stock
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <Button className="w-full h-14 mt-8">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>

            </div>

          </div>
        </div>
      </main>

      <Footer />
      <LivePlayer />
    </div>
  );
}
