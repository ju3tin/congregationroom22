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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DJ {
  _id: string
  name: string
}

export default function NewMixPage({
  djs,
}: {
  djs: DJ[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(
    formData: FormData
  ) {
    setLoading(true)

    const result = await createMix(formData)

    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }

    toast.success("Mix created")
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
            <Input
              name="title"
              placeholder="Title"
              required
            />

            <Input
              name="slug"
              placeholder="Slug"
              required
            />

            <Select name="djId">
              <SelectTrigger>
                <SelectValue placeholder="Select DJ" />
              </SelectTrigger>

              <SelectContent>
                {djs.map((dj) => (
                  <SelectItem
                    key={dj._id}
                    value={dj._id}
                  >
                    {dj.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              name="genre"
              placeholder="Genre"
              required
            />

            <Textarea
              name="description"
              rows={5}
              placeholder="Description"
            />

            <Input
              name="duration"
              type="number"
              placeholder="Duration (seconds)"
              required
            />

            <Input
              name="audioUrl"
              placeholder="Audio URL"
              required
            />

            <Input
              name="coverImage"
              placeholder="Cover Image URL"
              required
            />

            <Input
              type="date"
              name="releaseDate"
              required
            />

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="featured"
              />
              Featured Mix
            </label>
          </CardContent>
        </Card>

        <div className="flex justify-end">
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
