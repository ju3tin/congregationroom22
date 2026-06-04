"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface EventFormProps {
  mode: "create" | "edit"
  event?: any
}

export default function EventForm({
  mode,
  event,
}: EventFormProps) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    title: event?.title || "",
    slug: event?.slug || "",
    description: event?.description || "",

    image: event?.image || "",

    date: event?.date
      ? new Date(event.date).toISOString().slice(0, 16)
      : "",

    doors: event?.doors
      ? new Date(event.doors).toISOString().slice(0, 16)
      : "",

    endDate: event?.endDate
      ? new Date(event.endDate).toISOString().slice(0, 16)
      : "",

    venue: {
      name: event?.venue?.name || "",
      address: event?.venue?.address || "",
      city: event?.venue?.city || "",
    },

    status: event?.status || "draft",

    ticketTiers: event?.ticketTiers || [],
  })

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault()

    try {
      setLoading(true)

      const url =
        mode === "create"
          ? "/api/admin/events"
          : `/api/admin/events/${event._id}`

      const method =
        mode === "create"
          ? "POST"
          : "PUT"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        throw new Error("Failed")
      }

      router.push("/admin/events")
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Failed to save event")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      <div className="grid gap-6">
        <Input
          placeholder="Event Title"
          value={form.title}
          onChange={(e) =>
            setForm({
              ...form,
              title: e.target.value,
            })
          }
        />

        <Input
          placeholder="Slug"
          value={form.slug}
          onChange={(e) =>
            setForm({
              ...form,
              slug: e.target.value,
            })
          }
        />

        <Textarea
          placeholder="Description"
          rows={8}
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value,
            })
          }
        />

        <Input
          placeholder="Image URL"
          value={form.image}
          onChange={(e) =>
            setForm({
              ...form,
              image: e.target.value,
            })
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Event Date
          </label>

          <Input
            type="datetime-local"
            value={form.date}
            onChange={(e) =>
              setForm({
                ...form,
                date: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Doors Open
          </label>

          <Input
            type="datetime-local"
            value={form.doors}
            onChange={(e) =>
              setForm({
                ...form,
                doors: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            End Date
          </label>

          <Input
            type="datetime-local"
            value={form.endDate}
            onChange={(e) =>
              setForm({
                ...form,
                endDate: e.target.value,
              })
            }
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Venue
        </h2>

        <Input
          placeholder="Venue Name"
          value={form.venue.name}
          onChange={(e) =>
            setForm({
              ...form,
              venue: {
                ...form.venue,
                name: e.target.value,
              },
            })
          }
        />

        <Input
          placeholder="Address"
          value={form.venue.address}
          onChange={(e) =>
            setForm({
              ...form,
              venue: {
                ...form.venue,
                address: e.target.value,
              },
            })
          }
        />

        <Input
          placeholder="City"
          value={form.venue.city}
          onChange={(e) =>
            setForm({
              ...form,
              venue: {
                ...form.venue,
                city: e.target.value,
              },
            })
          }
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Status
        </label>

        <select
          className="w-full rounded-md border bg-background px-3 py-2"
          value={form.status}
          onChange={(e) =>
            setForm({
              ...form,
              status: e.target.value,
            })
          }
        >
          <option value="draft">
            Draft
          </option>
          <option value="published">
            Published
          </option>
          <option value="cancelled">
            Cancelled
          </option>
          <option value="completed">
            Completed
          </option>
        </select>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : mode === "create"
            ? "Create Event"
            : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
