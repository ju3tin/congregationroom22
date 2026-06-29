import { notFound } from "next/navigation"

import dbConnect from "@/lib/db"
import DJ from "@/models/DJ"

import EditDJForm from "./EditDJForm"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

async function getDJ(id: string) {
  await dbConnect()

  const dj = await DJ.findById(id).lean()

  if (!dj) {
    return null
  }

  return JSON.parse(JSON.stringify(dj))
}

export default async function EditDJPage({
  params,
}: PageProps) {
  const { id } = await params

  const dj = await getDJ(id)

  if (!dj) {
    notFound()
  }

  return <EditDJForm dj={dj} />
}
