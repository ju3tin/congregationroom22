import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Ticket, ShoppingBag, Settings, User } from "lucide-react"

const accountNav = [
  { name: "Overview", href: "/account", icon: User },
  { name: "My Tickets", href: "/account/tickets", icon: Ticket },
  { name: "Orders", href: "/account/orders", icon: ShoppingBag },
  { name: "Settings", href: "/account/settings", icon: Settings },
]

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/account")
  }

  return (
    <>
      <Header />
      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Sidebar */}
            <aside className="lg:w-64">
              <nav className="flex flex-row gap-2 overflow-x-auto pb-4 lg:flex-col lg:gap-1 lg:pb-0">
                {accountNav.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
