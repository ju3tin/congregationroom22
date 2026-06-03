"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { createMix } from "../actions"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface DJ {
  _id: string
  name: string
}

export default function NewMixForm({
  djs,
}: {
  djs: DJ[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)

    const result = await createMix(formData)

    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }

    toast.success("Mix created successfully")
    router.push("/admin/mixes")
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/mixes"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <h1 className="text-3xl font-bold">
          Create Mix
        </h1>
      </div>

      <form action={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>
              Mix Information
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                name="title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                name="slug"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>DJ</Label>

              <select
                name="djId"
                required
                className="w-full rounded-md border bg-background px-3 py-2"
              >
                <option value="">
                  Select DJ
                </option>

                {djs.map((dj) => (
                  <option
                    key={dj._id}
                    value={dj._id}
                  >
                    {dj.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Genre</Label>
              <Input
                name="genre"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                name="description"
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label>Duration (seconds)</Label>
              <Input
                name="duration"
                type="number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Audio URL</Label>
              <Input
                name="audioUrl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Cover Image URL</Label>
              <Input
                name="coverImage"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Release Date</Label>
              <Input
                name="releaseDate"
                type="date"
                required
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="featured"
              />
              Featured Mix
            </label>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            asChild
          >
            <Link href="/admin/mixes">
              Cancel
            </Link>
          </Button>

          <Button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating..."
              : "Create Mix"}
          </Button>
        </div>
      </form>
    </div>
  )
}
