import { format } from "date-fns"
import { Users } from "lucide-react"
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
import User from "@/models/User"

async function getUsers() {
  await dbConnect()
  const users = await User.find().sort({ createdAt: -1 }).lean()
  return JSON.parse(JSON.stringify(users))
}

export default async function AdminUsersPage() {
  const users = await getUsers()

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-destructive/10 text-destructive"
      case "organizer":
        return "bg-blue-500/10 text-blue-500"
      case "staff":
        return "bg-yellow-500/10 text-yellow-500"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="mt-2 text-muted-foreground">
          Manage users and their roles
        </p>
      </div>

      {users.length > 0 ? (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user: {
                _id: string
                name: string
                email: string
                role: string
                createdAt: string
              }) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.createdAt), "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <Users className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No users yet</h2>
          <p className="mt-2 text-muted-foreground">
            Users will appear here when they register
          </p>
        </div>
      )}
    </div>
  )
}
