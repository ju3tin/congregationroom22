import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

async function getProduct(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/products/${slug}`, {
    next: { revalidate: 3600 },
  });
  return res.ok ? res.json() : null;
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to Shop
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Images */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden border">
                <Image
                  src={product.images?.[0] || "/placeholder.jpg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {product.images?.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.slice(1).map((img: string, i: number) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border cursor-pointer hover:border-primary transition-colors">
                      <Image src={img} alt={`${product.name} ${i + 2}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-6">
                <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
                <p className="text-3xl font-semibold text-primary">
                  ${product.variants?.[0]?.price?.toFixed(2) || "0.00"}
                </p>
              </div>

              <div className="prose text-muted-foreground mb-8">
                <p>{product.description}</p>
              </div>

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-medium mb-3">Variants</h3>
                  <div className="grid gap-3">
                    {product.variants.map((variant: any, index: number) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{variant.name}</p>
                            <p className="text-sm text-muted-foreground">SKU: {variant.sku}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${variant.price}</p>
                            <p className="text-sm text-muted-foreground">{variant.stock} in stock</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart */}
              <Button size="lg" className="w-full mb-4 text-lg py-7">
                <ShoppingCart className="mr-3 h-5 w-5" />
                Add to Cart
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Free shipping on orders over $50
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
