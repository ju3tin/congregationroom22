// ==================== TIMELINE ACTIONS ====================

const timelineSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  startDate: z.object({
    year: z.number().min(1900).max(2100),
    month: z.number().min(1).max(12).optional(),
    day: z.number().min(1).max(31).optional(),
  }),
  endDate: z.object({
    year: z.number().min(1900).max(2100).optional(),
    month: z.number().min(1).max(12).optional(),
    day: z.number().min(1).max(31).optional(),
  }).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  media: z.object({
    url: z.string().optional(),
    caption: z.string().optional(),
    credit: z.string().optional(),
    thumbnail: z.string().optional(),
  }).optional(),
  location: z.object({
    name: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).optional(),
  sources: z.array(z.object({
    title: z.string(),
    url: z.string(),
  })).optional(),
  featured: z.boolean().default(false),
  sortOrder: z.number().default(0),
});

export async function getTimelineEvents() {
  try {
    await dbConnect();
    const events = await TimelineEvents.find().sort({ sortOrder: 1, startDate: -1 }).lean();
    return events.map(e => ({ ...e, id: e._id.toString() }));
  } catch (error) {
    console.error("Get timeline events error:", error);
    return [];
  }
}

export async function getTimelineEvent(id: string) {
  try {
    await dbConnect();
    const event = await TimelineEvents.findById(id).lean();
    if (!event) return null;
    return { ...event, id: event._id.toString() };
  } catch (error) {
    console.error("Get timeline event error:", error);
    return null;
  }
}

export async function createTimelineEvent(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  // Parse complex fields
  const rawData = {
    title: formData.get("title"),
    description: formData.get("description"),
    startDate: JSON.parse(formData.get("startDate") as string),
    endDate: formData.get("endDate") ? JSON.parse(formData.get("endDate") as string) : undefined,
    category: formData.get("category"),
    tags: JSON.parse(formData.get("tags") as string || "[]"),
    media: JSON.parse(formData.get("media") as string || "{}"),
    location: JSON.parse(formData.get("location") as string || "{}"),
    sources: JSON.parse(formData.get("sources") as string || "[]"),
    featured: formData.get("featured") === "true",
    sortOrder: Number(formData.get("sortOrder")) || 0,
  };

  const result = timelineSchema.safeParse(rawData);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  try {
    await dbConnect();
    await TimelineEvents.create(result.data);
    revalidatePath("api/admin/timeline");
    return { success: true };
  } catch (error) {
    console.error("Create timeline error:", error);
    return { error: "Failed to create event" };
  }
}

export async function updateTimelineEvent(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const rawData = {
    title: formData.get("title"),
    description: formData.get("description"),
    startDate: JSON.parse(formData.get("startDate") as string),
    endDate: formData.get("endDate") ? JSON.parse(formData.get("endDate") as string) : undefined,
    category: formData.get("category"),
    tags: JSON.parse(formData.get("tags") as string || "[]"),
    media: JSON.parse(formData.get("media") as string || "{}"),
    location: JSON.parse(formData.get("location") as string || "{}"),
    sources: JSON.parse(formData.get("sources") as string || "[]"),
    featured: formData.get("featured") === "true",
    sortOrder: Number(formData.get("sortOrder")) || 0,
  };

  const result = timelineSchema.safeParse(rawData);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  try {
    await dbConnect();
    await TimelineEvents.findByIdAndUpdate(id, result.data);
    revalidatePath("/admin/timeline");
    return { success: true };
  } catch (error) {
    console.error("Update timeline error:", error);
    return { error: "Failed to update event" };
  }
}

export async function deleteTimelineEvent(id: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  try {
    await dbConnect();
    await TimelineEvents.findByIdAndDelete(id);
    revalidatePath("/admin/timeline");
    return { success: true };
  } catch (error) {
    console.error("Delete timeline error:", error);
    return { error: "Failed to delete event" };
  }
}
