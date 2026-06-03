import Link from "next/link"
import { format } from "date-fns"
import { Plus, Disc3 } from "lucide-react"

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

// IMPORTANT: force registration of DJ model
import "@/models/DJ"

import Mix from "@/models/Mix"

async function getMixes() {
  await dbConnect()

  const mixes = await Mix.find()
    .populate("djId", "name slug")
    .sort({ releaseDate: -1 })
    .lean()

  return JSON.parse(JSON.stringify(mixes))
}

export default async function AdminMixesPage() {
  const mixes = await getMixes()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mixes</h1>
          <p className="mt-2 text-muted-foreground">
            Manage all mixes on the platform
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/mixes/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Mix
          </Link>
        </Button>
      </div>

      {mixes.length > 0 ? (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mix</TableHead>
                <TableHead>DJ</TableHead>
                <TableHead>Genre</TableHead>
                <TableHead>Release Date</TableHead>
                <TableHead>Plays</TableHead>
                <TableHead className="text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {mixes.map((mix: any) => (
                <TableRow key={mix._id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {mix.title}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {mix.slug}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    {mix.djId?.name || "Unknown DJ"}
                  </TableCell>

                  <TableCell>
                    {mix.genre}
                  </TableCell>

                  <TableCell>
                    {mix.releaseDate
                      ? format(
                          new Date(mix.releaseDate),
                          "MMM d, yyyy"
                        )
                      : "-"}
                  </TableCell>

                  <TableCell>
                    {mix.plays || 0}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                    >
                      <Link
                        href={`/admin/mixes/${mix._id}`}
                      >
                        Edit
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <Disc3 className="h-12 w-12 text-muted-foreground" />

          <h2 className="mt-4 text-xl font-semibold">
            No mixes yet
          </h2>

          <p className="mt-2 text-muted-foreground">
            Create your first mix to get started
          </p>

          <Button asChild className="mt-4">
            <Link href="/admin/mixes/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Mix
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
