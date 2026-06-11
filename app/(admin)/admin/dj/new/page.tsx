"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { createDJ } from "../actions"
import { toast } from "sonner"

export default function NewDJPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)

    const result = await createDJ(formData)

    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }

    toast.success("DJ created successfully")
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
          Create DJ
        </h1>
      </div>

      <form action={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>DJ Information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  DJ Name
                </Label>

                <Input
                  id="name"
                  name="name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">
                  Slug
                </Label>

                <Input
                  id="slug"
                  name="slug"
                  required
                  placeholder="dj-nova"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre">
                Genre
              </Label>

              <Input
                id="genre"
                name="genre"
                required
                placeholder="House, Techno, Drum & Bass..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">
                Biography
              </Label>

              <Textarea
                id="bio"
                name="bio"
                rows={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">
                Profile Image URL
              </Label>

              <Input
                id="image"
                name="image"
                type="url"
                required
                placeholder="https://..."
              />
            </div>
          </CardContent>
        </Card>
        {/* ==================== FEATURED SECTION ==================== */}
<Card>
  <CardHeader>
    <CardTitle>Featured on Homepage</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="flex items-center gap-3">
      <Switch
        checked={form.featured}
        onCheckedChange={(checked) => 
          setForm((prev) => ({ ...prev, featured: checked }))
        }
      />
      <div>
        <Label className="text-base">Mark as Featured</Label>
        <p className="text-sm text-muted-foreground">
          This DJ will appear in the featured section on the homepage
        </p>
      </div>
    </div>
  </CardContent>
</Card>
        <Card>
          <CardHeader>
            <CardTitle>
              Social Media Links
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">
                Instagram
              </Label>

              <Input
                id="instagram"
                name="instagram"
                placeholder="https://instagram.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="soundcloud">
                SoundCloud
              </Label>

              <Input
                id="soundcloud"
                name="soundcloud"
                placeholder="https://soundcloud.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter">
                Twitter / X
              </Label>

              <Input
                id="twitter"
                name="twitter"
                placeholder="https://x.com/..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
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
              ? "Creating..."
              : "Create DJ"}
          </Button>
        </div>
      </form>
    </div>
  )
}
