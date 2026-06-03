"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"

import { toast } from "sonner"

import { saveSchedule } from "./actions"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

interface Slot {
  dayOfWeek: number
  startTime: string
  endTime: string
  djId: string
  showName: string
}

export default function ScheduleEditor({
  schedule,
  djs,
}: {
  schedule: any
  djs: any[]
}) {
  const [loading, setLoading] =
    useState(false)

  const [slots, setSlots] =
    useState<Slot[]>(
      schedule?.slots || []
    )

  function addSlot() {
    setSlots([
      ...slots,
      {
        dayOfWeek: 0,
        startTime: "00:00",
        endTime: "01:00",
        djId: "",
        showName: "",
      },
    ])
  }

  function removeSlot(index: number) {
    setSlots(
      slots.filter(
        (_, i) => i !== index
      )
    )
  }

  function updateSlot(
    index: number,
    field: keyof Slot,
    value: string | number
  ) {
    const updated = [...slots]

    updated[index] = {
      ...updated[index],
      [field]: value,
    }

    setSlots(updated)
  }

  async function handleSave() {
    setLoading(true)

    const result =
      await saveSchedule(slots)

    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }

    toast.success(
      "Schedule updated"
    )

    setLoading(false)
  }

  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        <div className="flex justify-end">
          <Button
            onClick={addSlot}
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Slot
          </Button>
        </div>

        <div className="space-y-4">
          {slots.map(
            (slot, index) => (
              <div
                key={index}
                className="grid gap-4 rounded-lg border p-4 md:grid-cols-6"
              >
                <select
                  value={
                    slot.dayOfWeek
                  }
                  onChange={(e) =>
                    updateSlot(
                      index,
                      "dayOfWeek",
                      Number(
                        e.target.value
                      )
                    )
                  }
                  className="rounded-md border p-2"
                >
                  {DAYS.map(
                    (
                      day,
                      dayIndex
                    ) => (
                      <option
                        key={
                          dayIndex
                        }
                        value={
                          dayIndex
                        }
                      >
                        {day}
                      </option>
                    )
                  )}
                </select>

                <input
                  type="time"
                  value={
                    slot.startTime
                  }
                  onChange={(e) =>
                    updateSlot(
                      index,
                      "startTime",
                      e.target.value
                    )
                  }
                  className="rounded-md border p-2"
                />

                <input
                  type="time"
                  value={
                    slot.endTime
                  }
                  onChange={(e) =>
                    updateSlot(
                      index,
                      "endTime",
                      e.target.value
                    )
                  }
                  className="rounded-md border p-2"
                />

                <select
                  value={slot.djId}
                  onChange={(e) =>
                    updateSlot(
                      index,
                      "djId",
                      e.target.value
                    )
                  }
                  className="rounded-md border p-2"
                >
                  <option value="">
                    Select DJ
                  </option>

                  {djs.map((dj) => (
                    <option
                      key={
                        dj._id
                      }
                      value={
                        dj._id
                      }
                    >
                      {dj.name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={
                    slot.showName
                  }
                  placeholder="Show Name"
                  onChange={(e) =>
                    updateSlot(
                      index,
                      "showName",
                      e.target.value
                    )
                  }
                  className="rounded-md border p-2"
                />

                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() =>
                    removeSlot(
                      index
                    )
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )
          )}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : "Save Schedule"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
