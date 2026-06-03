import Link from "next/link"
import Image from "next/image"
import { Plus, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import dbConnect from "@/lib/db"
import DJ from "@/models/DJ"

async function getDJs() {
  await dbConnect()

  const djs = await DJ.find()
    .sort({ name: 1 })
    .lean()

  return JSON.parse(JSON.stringify(djs))
}

export default async function AdminDJsPage() {
  const djs = await getDJs()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">DJs</h1>
          <p className="mt-2 text-muted-foreground">
            Manage all DJs on the platform
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/djs/new">
            <Plus className="mr-2 h-4 w-4" />
            Add DJ
          </Link>
        </Button>
      </div>

      {djs.length > 0 ? (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>DJ</TableHead>
                <TableHead>Genre</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Socials</TableHead>
                <TableHead className="text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {djs.map(
                (dj: {
                  _id: string
                  name: string
                  slug: string
                  genre: string
                  image: string
                  socialLinks?: {
                    instagram?: string
                    soundcloud?: string
                    twitter?: string
                  }
                }) => {
                  const socialCount = [
                    dj.socialLinks?.instagram,
                    dj.socialLinks?.soundcloud,
                    dj.socialLinks?.twitter,
                  ].filter(Boolean).length

                  return (
                    <TableRow key={dj._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 overflow-hidden rounded-md">
                            <Image
                              src={dj.image}
                              alt={dj.name}
                              fill
                              className="object-cover"
                            />
                          </div>

                          <div>
                            <p className="font-medium">
                              {dj.name}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {dj.genre}
                      </TableCell>

                      <TableCell>
                        <code className="text-xs">
                          {dj.slug}
                        </code>
                      </TableCell>

                      <TableCell>
                        {socialCount}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                        >
                          <Link
                            href={`/admin/djs/${dj._id}`}
                          >
                            Edit
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                }
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <Users className="h-12 w-12 text-muted-foreground" />

          <h2 className="mt-4 text-xl font-semibold">
            No DJs yet
          </h2>

          <p className="mt-2 text-muted-foreground">
            Create your first DJ to get started
          </p>

          <Button asChild className="mt-4">
            <Link href="/admin/djs/new">
              <Plus className="mr-2 h-4 w-4" />
              Add DJ
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
