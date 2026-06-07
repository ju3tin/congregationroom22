"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { updateEvent } from "../../actions" // Adjust path if needed
import { toast } from "sonner"

interface TicketTier {
  name: string
  price: number
  quantity: number
  maxPerOrder: number
  salesStart: string
  salesEnd: string
}

interface LineupItem {
  dj: string
  setTime?: string
  headline: boolean
}

interface DJOption {
  _id: string
  name: string
}

interface EventData {
  _id: string
  title: string
  slug: string
  description: string
  venue: {
    name: string
    address: string
    city: string
  }
  date: string
  doors: string
  endDate?: string
  image: string
  status: string
  ticketTiers: any[]
  lineup: any[]
}

export default function EditEventPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [eventLoading, setEventLoading] = useState(true)
  const [djs, setDjs] = useState<DJOption[]>([])
  const [djsLoading, setDjsLoading] = useState(true)

  const [formData, setFormData] = useState<EventData>({
    _id: params.id,
    title: "",
    slug: "",
    description: "",
    venue: { name: "", address: "", city: "" },
    date: "",
    doors: "",
    endDate: "",
    image: "",
    status: "draft",
    ticketTiers: [],
    lineup: [],
  })

  const [tiers, setTiers] = useState<TicketTier[]>([])
  const [lineup, setLineup] = useState<LineupItem[]>([])

  // Fetch DJs
  useEffect(() => {
    async function fetchDJs() {
      try {
        const res = await fetch("/api/djs")
        if (res.ok) {
          const data = await res.json()
          setDjs(data)
        }
      } catch (error) {
        toast.error("Failed to load DJs")
      } finally {
        setDjsLoading(false)
      }
    }
    fetchDJs()
  }, [])

  // Fetch Event
  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${params.id}`)
        if (res.ok) {
          const event = await res.json()

          setFormData({
            ...event,
            date: new Date(event.date).toISOString().slice(0, 16),
            doors: new Date(event.doors).toISOString().slice(0, 16),
            endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : "",
          })

          // Format ticket tiers for form
          setTiers(event.ticketTiers.map((tier: any) => ({
            ...tier,
            salesStart: new Date(tier.salesStart).toISOString().slice(0, 16),
            salesEnd: new Date(tier.salesEnd).toISOString().slice(0, 16),
          })))

          // Format lineup
          setLineup(event.lineup.map((item: any) => ({
            dj: item.dj._id || item.dj,
            setTime: item.setTime ? new Date(item.setTime).toISOString().slice(0, 16) : "",
            headline: item.headline || false,
          })))
        } else {
          toast.error("Event not found")
          router.push("/admin/events")
        }
      } catch (error) {
        toast.error("Failed to load event")
      } finally {
        setEventLoading(false)
      }
    }

    fetchEvent()
  }, [params.id, router])

  const addTier = () => { /* same as new page */ }
  const removeTier = (index: number) => { /* same */ }
  const updateTier = (index: number, field: keyof TicketTier, value: string | number) => { /* same */ }

  const addLineupItem = () => {
    setLineup([...lineup, { dj: "", headline: false }])
  }

  const removeLineupItem = (index: number) => {
    if (lineup.length > 1) {
      setLineup(lineup.filter((_, i) => i !== index))
    }
  }

  const updateLineupItem = (index: number, field: keyof LineupItem, value: string | boolean) => {
    const updated = [...lineup]
    updated[index] = { ...updated[index], [field]: value }
    setLineup(updated)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const payload = {
      ...formData,
      ticketTiers: tiers,
      lineup: lineup,
    }

    const result = await updateEvent(params.id, payload)
    
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Event updated successfully")
      router.push("/admin/events")
    }
    setLoading(false)
  }

  if (eventLoading) {
    return <div className="p-8">Loading event...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-3xl font-bold">Edit Event</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info, Venue, Date & Time Cards - same structure as NewEventPage but using formData state */}

        {/* Example for Basic Info (repeat pattern for others) */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Event Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </div>
            </div>
            {/* Add other fields similarly... */}
          </CardContent>
        </Card>

        {/* Venue Card */}
        <Card>
          <CardHeader>
            <CardTitle>Venue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Venue Name</Label>
              <Input
                value={formData.venue.name}
                onChange={(e) => setFormData({
                  ...formData,
                  venue: { ...formData.venue, name: e.target.value }
                })}
                required
              />
            </div>
            {/* address and city similarly */}
          </CardContent>
        </Card>

        {/* Lineup Card - Same as New but with existing data */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Lineup</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addLineupItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add DJ
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {lineup.map((item, index) => (
              <div key={index} className="rounded-lg border border-border p-4 space-y-4">
                {/* Same Lineup UI as NewEventPage */}
                <div className="space-y-2">
                  <Label>DJ</Label>
                  <Select
                    value={item.dj}
                    onValueChange={(value) => updateLineupItem(index, "dj", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a DJ" />
                    </SelectTrigger>
                    <SelectContent>
                      {djs.map((dj) => (
                        <SelectItem key={dj._id} value={dj._id}>
                          {dj.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Set Time and Headline - same as before */}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Ticket Tiers Card - Same as New */}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/events">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Event"}
          </Button>
        </div>
      </form>
    </div>
  )
}
