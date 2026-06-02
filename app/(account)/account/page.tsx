import Link from "next/link"
import { format } from "date-fns"
import { auth } from "@/lib/auth"
import { ArrowRight, Ticket, ShoppingBag } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import dbConnect from "@/lib/db"
import { Order, Ticket as TicketModel } from "@/models"

async function getAccountStats(userId: string) {
  await dbConnect()

  const [ticketCount, orderCount, recentOrders] = await Promise.all([
    TicketModel.countDocuments({ userId, status: "valid" }),
    Order.countDocuments({ userId, status: "paid" }),
    Order.find({ userId, status: "paid" })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean(),
  ])

  return {
    ticketCount,
    orderCount,
    recentOrders: JSON.parse(JSON.stringify(recentOrders)),
  }
}

export default async function AccountPage() {
  const session = await auth()
  const { ticketCount, orderCount, recentOrders } = await getAccountStats(
    session!.user.id
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {session!.user.name}</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your tickets, orders, and account settings
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{ticketCount}</div>
            <Link
              href="/account/tickets"
              className="mt-2 inline-flex items-center gap-1 text-sm text-accent hover:underline"
            >
              View all tickets
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{orderCount}</div>
            <Link
              href="/account/orders"
              className="mt-2 inline-flex items-center gap-1 text-sm text-accent hover:underline"
            >
              View order history
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/account/orders">View All</Link>
          </Button>
        </div>

        {recentOrders.length > 0 ? (
          <div className="mt-4 space-y-4">
            {recentOrders.map((order: { _id: string; orderNumber: string; createdAt: string; total: number; items: { name: string }[] }) => (
              <Card key={order._id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(order.createdAt), "MMM d, yyyy")} -{" "}
                      {order.items.length}{" "}
                      {order.items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${order.total.toFixed(2)}</p>
                    <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
                      Paid
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="mt-4">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">No orders yet</p>
              <Button asChild className="mt-4">
                <Link href="/events">Browse Events</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
