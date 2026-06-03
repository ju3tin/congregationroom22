import dbConnect from "@/lib/db"
import DJ from "@/models/DJ"

import NewMixForm from "./NewMixForm"

async function getDJs() {
  await dbConnect()

  const djs = await DJ.find()
    .sort({ name: 1 })
    .lean()

  return JSON.parse(JSON.stringify(djs))
}

export default async function NewMixPage() {
  const djs = await getDJs()

  return <NewMixForm djs={djs} />
}
