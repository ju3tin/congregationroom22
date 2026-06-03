"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { updateMix, deleteMix } from "../actions"

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

interface Mix {
  _id: string
  title: string
  slug: string
  djId: string
  genre: string
  description?: string
  duration: number
  audioUrl: string
  coverImage: string
  releaseDate: string
  featured: boolean
}

export default function EditMixForm({
  mix,
  djs,
}: {
  mix: Mix
  djs: DJ[]
}) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleSubmit(
    formData: FormData
  ) {
    setLoading(true)

    const result = await updateMix(
      mix._id,
      formData
    )

    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }

    toast.success("Mix updated")
    router.refresh()
  }

  async function handleDelete() {
    const confirmed = confirm(
      "Delete this mix?"
    )

    if (!confirmed) return

    setDeleting(true)

    const result = await deleteMix(
      mix._id
    )

    if (result.error) {
      toast.error(result.error)
      setDeleting(false)
      return
    }

    toast.success("Mix deleted")
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
          Edit Mix
        </h1>
      </div>

      <form
        action={handleSubmit}
        className="space-y-8"
      >
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
                defaultValue={mix.title}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                name="slug"
                defaultValue={mix.slug}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>DJ</Label>

              <select
                name="djId"
                defaultValue={mix.djId}
                required
                className="w-full rounded-md border bg-background px-3 py-2"
              >
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
                defaultValue={mix.genre}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                name="description"
                rows={5}
                defaultValue={
                  mix.description || ""
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                Duration (seconds)
              </Label>
              <Input
                name="duration"
                type="number"
                defaultValue={mix.duration}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Audio URL</Label>
              <Input
                name="audioUrl"
                defaultValue={mix.audioUrl}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>
                Cover Image URL
              </Label>
              <Input
                name="coverImage"
                defaultValue={mix.coverImage}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>
                Release Date
              </Label>
              <Input
                type="date"
                name="releaseDate"
                defaultValue={
                  new Date(
                    mix.releaseDate
                  )
                    .toISOString()
                    .split("T")[0]
                }
                required
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={
                  mix.featured
                }
              />
              Featured Mix
            </label>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            Delete Mix
          </Button>

          <div className="flex gap-4">
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
                ? "Saving..."
                : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
