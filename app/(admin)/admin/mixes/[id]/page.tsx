import { notFound } from "next/navigation"

import dbConnect from "@/lib/db"
import Mix from "@/models/Mix"
import DJ from "@/models/DJ"

import EditMixForm from "./EditMixForm"

async function getData(id: string) {
  await dbConnect()

  const [mix, djs] = await Promise.all([
    Mix.findById(id).lean(),
    DJ.find().sort({ name: 1 }).lean(),
  ])

  return {
    mix: mix
      ? JSON.parse(JSON.stringify(mix))
      : null,
    djs: JSON.parse(JSON.stringify(djs)),
  }
}

export default async function EditMixPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { mix, djs } = await getData(id)

  if (!mix) {
    notFound()
  }

  return (
    <EditMixForm
      mix={mix}
      djs={djs}
    />
  )
}
