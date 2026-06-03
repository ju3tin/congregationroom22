"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { toast } from "sonner"

import { updateDJ, deleteDJ } from "../actions"

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

interface Props {
  dj: {
    _id: string
    name: string
    slug: string
    genre: string
    bio: string
    image: string
    socialLinks?: {
      instagram?: string
      soundcloud?: string
      twitter?: string
    }
  }
}

export default function EditDJForm({
  dj,
}: Props) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleSubmit(
    formData: FormData
  ) {
    setLoading(true)

    const result = await updateDJ(
      dj._id,
      formData
    )

    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }

    toast.success("DJ updated successfully")
    router.refresh()
    setLoading(false)
  }

  async function handleDelete() {
    if (
      !confirm(
        "Are you sure you want to delete this DJ?"
      )
    ) {
      return
    }

    setDeleting(true)

    const result = await deleteDJ(dj._id)

    if (result.error) {
      toast.error(result.error)
      setDeleting(false)
      return
    }

    toast.success("DJ deleted")
    router.push("/admin/djs")
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/djs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <h1 className="text-3xl font-bold">
          Edit DJ
        </h1>
      </div>

      <form
        action={handleSubmit}
        className="space-y-8"
      >
        <Card>
          <CardHeader>
            <CardTitle>
              DJ Information
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  name="name"
                  defaultValue={dj.name}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  name="slug"
                  defaultValue={dj.slug}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Genre</Label>
              <Input
                name="genre"
                defaultValue={dj.genre}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Biography</Label>
              <Textarea
                name="bio"
                rows={6}
                defaultValue={dj.bio}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                name="image"
                type="url"
                defaultValue={dj.image}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Social Links
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Instagram</Label>
              <Input
                name="instagram"
                defaultValue={
                  dj.socialLinks?.instagram
                }
              />
            </div>

            <div className="space-y-2">
              <Label>SoundCloud</Label>
              <Input
                name="soundcloud"
                defaultValue={
                  dj.socialLinks?.soundcloud
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Twitter / X</Label>
              <Input
                name="twitter"
                defaultValue={
                  dj.socialLinks?.twitter
                }
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting
              ? "Deleting..."
              : "Delete DJ"}
          </Button>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              asChild
            >
              <Link href="/admin/djs">
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
