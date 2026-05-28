import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import {
  LayoutDashboard,
  Calendar,
  ShoppingBag,
  Package,
  Users,
  FileText,
  Tag,
  Settings,
  Music2,
} from "lucide-react"

const adminNav = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Events", href: "/admin/events", icon: Calendar },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Pages", href: "/admin/pages", icon: FileText },
  { name: "Promo Codes", href: "/admin/promo-codes", icon: Tag },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin")
  }

  if (session.user.role !== "admin") {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-sidebar">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <Music2 className="h-6 w-6" />
          <span className="font-bold">Admin Panel</span>
        </div>
        <nav className="space-y-1 p-4">
          {adminNav.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border p-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Back to Site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pl-64">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
