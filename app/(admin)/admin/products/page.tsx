import Link from "next/link"
import { Plus, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import dbConnect from "@/lib/db"
import Product from "@/models/Product"

async function getProducts() {
  await dbConnect()
  const products = await Product.find().sort({ createdAt: -1 }).lean()
  return JSON.parse(JSON.stringify(products))
}

export default async function AdminProductsPage() {
  const products = await getProducts()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success/10 text-success"
      case "draft":
        return "bg-yellow-500/10 text-yellow-500"
      case "archived":
        return "bg-secondary text-secondary-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="mt-2 text-muted-foreground">
            Manage merchandise and products
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {products.length > 0 ? (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Variants</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product: {
                _id: string
                name: string
                category: string
                status: string
                variants: { name: string; stock: number; price: number }[]
              }) => {
                const totalStock = product.variants.reduce(
                  (sum, v) => sum + v.stock,
                  0
                )
                const priceRange =
                  product.variants.length > 0
                    ? `$${Math.min(...product.variants.map((v) => v.price)).toFixed(2)} - $${Math.max(...product.variants.map((v) => v.price)).toFixed(2)}`
                    : "N/A"

                return (
                  <TableRow key={product._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {priceRange}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.variants.length}</TableCell>
                    <TableCell>{totalStock}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(product.status)}>
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/products/${product._id}`}>Edit</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <Package className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No products yet</h2>
          <p className="mt-2 text-muted-foreground">
            Create your first product to get started
          </p>
          <Button asChild className="mt-4">
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
