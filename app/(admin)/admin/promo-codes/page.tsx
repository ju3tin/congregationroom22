import Link from "next/link"
import { Plus, Tag } from "lucide-react"
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
import PromoCode from "@/models/PromoCode"
import { format } from "date-fns"

async function getPromoCodes() {
  await dbConnect()
  const codes = await PromoCode.find().sort({ createdAt: -1 }).lean()
  return JSON.parse(JSON.stringify(codes))
}

export default async function AdminPromoCodesPage() {
  const promoCodes = await getPromoCodes()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Promo Codes</h1>
          <p className="mt-2 text-muted-foreground">
            Manage discount codes and promotions
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/promo-codes/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Promo Code
          </Link>
        </Button>
      </div>

      {promoCodes.length > 0 ? (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Valid Period</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promoCodes.map((code: {
                _id: string
                code: string
                discountType: string
                discountValue: number
                usedCount: number
                maxUses?: number
                validFrom: string
                validUntil: string
              }) => {
                const now = new Date()
                const isActive =
                  new Date(code.validFrom) <= now &&
                  new Date(code.validUntil) >= now &&
                  (!code.maxUses || code.usedCount < code.maxUses)

                return (
                  <TableRow key={code._id}>
                    <TableCell className="font-mono font-semibold">
                      {code.code}
                    </TableCell>
                    <TableCell>
                      {code.discountType === "percentage"
                        ? `${code.discountValue}%`
                        : `$${code.discountValue.toFixed(2)}`}
                    </TableCell>
                    <TableCell>
                      {code.usedCount}
                      {code.maxUses && ` / ${code.maxUses}`}
                    </TableCell>
                    <TableCell>
                      {format(new Date(code.validFrom), "MMM d")} -{" "}
                      {format(new Date(code.validUntil), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          isActive
                            ? "bg-success/10 text-success"
                            : "bg-secondary text-secondary-foreground"
                        }
                      >
                        {isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <Tag className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No promo codes yet</h2>
          <p className="mt-2 text-muted-foreground">
            Create your first promo code to offer discounts
          </p>
          <Button asChild className="mt-4">
            <Link href="/admin/promo-codes/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Promo Code
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
