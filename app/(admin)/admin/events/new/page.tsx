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
import { createEvent } from "../actions"
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
  dj: string          // Will store DJ _id as string
  setTime?: string
  headline: boolean
}

interface DJOption {
  _id: string
  name: string
}

export default function NewEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [djs, setDjs] = useState<DJOption[]>([])
  const [djsLoading, setDjsLoading] = useState(true)

  const [tiers, setTiers] = useState<TicketTier[]>([
    {
      name: "General Admission",
      price: 50,
      quantity: 100,
      maxPerOrder: 10,
      salesStart: new Date().toISOString().slice(0, 16),
      salesEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16),
    },
  ])

  const [lineup, setLineup] = useState<LineupItem[]>([
    {
      dj: "",
      headline: false,
    },
  ])

  // Fetch DJs
  useEffect(() => {
    async function fetchDJs() {
      try {
        const res = await fetch("/api/djs") // We'll create this route
        if (res.ok) {
          const data = await res.json()
          setDjs(data)
        } else {
          toast.error("Failed to load DJs")
        }
      } catch (error) {
        toast.error("Error loading DJs")
      } finally {
        setDjsLoading(false)
      }
    }

    fetchDJs()
  }, [])

  const addTier = () => { ... } // (unchanged)

  const removeTier = (index: number) => { ... } // (unchanged)

  const updateTier = (index: number, field: keyof TicketTier, value: string | number) => { ... } // (unchanged)

  const addLineupItem = () => {
    setLineup([
      ...lineup,
      { dj: "", headline: false },
    ])
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

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    formData.append("ticketTiers", JSON.stringify(tiers))
    formData.append("lineup", JSON.stringify(lineup))
    
    const result = await createEvent(formData)
    if (result.error) {
      toast.error(result.error)
      setLoading(false)
    } else {
      toast.success("Event created successfully")
      router.push("/admin/events")
    }
  }

  return (
    <div className="space-y-8">
      {/* Header unchanged */}

      <form action={handleSubmit} className="space-y-8">
        {/* Basic Info, Venue, Date & Time Cards unchanged */}

        {/* === LINEUP CARD === */}
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
              <div
                key={index}
                className="rounded-lg border border-border p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Lineup Item {index + 1}</h4>
                  {lineup.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLineupItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>DJ</Label>
                  <Select
                    value={item.dj}
                    onValueChange={(value) => updateLineupItem(index, "dj", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a DJ" />
                    </SelectTrigger>
                    <SelectContent>
                      {djsLoading ? (
                        <SelectItem value="" disabled>Loading DJs...</SelectItem>
                      ) : djs.length === 0 ? (
                        <SelectItem value="" disabled>No DJs found</SelectItem>
                      ) : (
                        djs.map((dj) => (
                          <SelectItem key={dj._id} value={dj._id}>
                            {dj.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Set Time (optional)</Label>
                    <Input
                      type="datetime-local"
                      value={item.setTime || ""}
                      onChange={(e) => updateLineupItem(index, "setTime", e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-3 pt-8">
                    <Checkbox
                      id={`headline-${index}`}
                      checked={item.headline}
                      onCheckedChange={(checked) => 
                        updateLineupItem(index, "headline", !!checked)
                      }
                    />
                    <Label htmlFor={`headline-${index}`} className="cursor-pointer">
                      Headline Act
                    </Label>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Ticket Tiers Card (unchanged) */}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/events">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Event"}
          </Button>
        </div>
      </form>
    </div>
  )
}
