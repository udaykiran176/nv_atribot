import { NextResponse } from 'next/server'
import { db } from '@/db/drizzle'
import { courses } from '@/db/schema'
import { auth } from '@clerk/nextjs/server'
import { isAdminUser } from '@/lib/admin'

export async function GET() {
  const all = await db.select().from(courses)
  return NextResponse.json(all)
}

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!isAdminUser(userId)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({})) as { title?: string, description?: string }
  const title = body.title?.trim()
  const description = body.description?.trim()
  if (!title || !description) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const [created] = await db.insert(courses).values({ title, description }).returning()
  return NextResponse.json(created)
}
