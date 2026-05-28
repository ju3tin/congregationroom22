import Link from "next/link"
import { format } from "date-fns"
import { ShoppingBag } from "lucide-react"
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
import Order from "@/models/Order"

async function getOrders() {
  await dbConnect()
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .populate("userId", "name email")
    .lean()
  return JSON.parse(JSON.stringify(orders))
}

export default async function AdminOrdersPage() {
  const orders = await getOrders()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-success/10 text-success"
      case "pending":
        return "bg-yellow-500/10 text-yellow-500"
      case "refunded":
        return "bg-blue-500/10 text-blue-500"
      case "cancelled":
        return "bg-destructive/10 text-destructive"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="mt-2 text-muted-foreground">
          View and manage all orders
        </p>
      </div>

      {orders.length > 0 ? (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order: {
                _id: string
                orderNumber: string
                createdAt: string
                total: number
                type: string
                status: string
                items: { name: string }[]
                userId?: { name: string; email: string }
              }) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{order.userId?.name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.userId?.email || ""}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.createdAt), "MMM d, yyyy h:mm a")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{order.type}</Badge>
                  </TableCell>
                  <TableCell>{order.items.length}</TableCell>
                  <TableCell className="font-semibold">
                    ${order.total.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No orders yet</h2>
          <p className="mt-2 text-muted-foreground">
            Orders will appear here when customers make purchases
          </p>
        </div>
      )}
    </div>
  )
}
