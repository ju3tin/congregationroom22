import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TimelineEvent from '@/models/TimelineEvent';
import { getAuthUser } from '@/lib/db';

export async function GET() {
  await connectDB();
  const events = await TimelineEvent.find().sort({ 'start_date.year': 1 });
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user || !['admin'].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await connectDB();
  const data = await req.json();
  const event = await TimelineEvent.create(data);
  return NextResponse.json(event, { status: 201 });
}
