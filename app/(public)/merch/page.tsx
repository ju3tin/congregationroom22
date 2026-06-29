import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LivePlayer } from "@/components/live-player";

async function getProducts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/products`, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });
  return res.ok ? res.json() : [];
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold tracking-tight mb-4">Merch Store</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Rep your favorite radio station with official Congregation Room 22 merchandise.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.length > 0 ? (
              products.map((product: any) => (
                <Link key={product._id} href={`/products/${product.slug}`}>
                  <Card className="group overflow-hidden bg-card hover:bg-secondary/30 transition-colors border-border h-full flex flex-col">
                    <CardContent className="p-0 flex flex-col h-full">
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={product.images?.[0] || "/placeholder.jpg"}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <div className="p-6 flex-1 flex flex-col">
                        <div className="mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {product.category}
                          </Badge>
                        </div>
                        
                        <h3 className="font-semibold mb-1 line-clamp-2">{product.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                          {product.description}
                        </p>

                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-2xl font-bold text-primary">
                            ${product.variants?.[0]?.price?.toFixed(2) || "0.00"}
                          </span>
                          <Button size="sm" className="flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4" />
                            Shop
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <p className="text-muted-foreground text-xl">No products available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <LivePlayer />
    </div>
  );
}
