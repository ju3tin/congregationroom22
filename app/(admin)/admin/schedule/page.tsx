import dbConnect from "@/lib/db"

import Schedule from "@/models/Schedule"
import DJ from "@/models/DJ"

import ScheduleEditor from "./ScheduleEditor"

async function getData() {
  await dbConnect()

  const [schedule, djs] = await Promise.all([
    Schedule.findOne().lean(),
    DJ.find()
      .sort({ name: 1 })
      .lean(),
  ])

  return {
    schedule: schedule
      ? JSON.parse(JSON.stringify(schedule))
      : null,
    djs: JSON.parse(JSON.stringify(djs)),
  }
}

export default async function AdminSchedulePage() {
  const { schedule, djs } = await getData()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Schedule
        </h1>

        <p className="mt-2 text-muted-foreground">
          Manage the weekly radio schedule
        </p>
      </div>

      <ScheduleEditor
        schedule={schedule}
        djs={djs}
      />
    </div>
  )
}
