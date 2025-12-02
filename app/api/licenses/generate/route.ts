import { NextResponse } from 'next/server'
import { db } from '@/db/drizzle'
import { licenseKeys, courses } from '@/db/schema'
import { eq } from 'drizzle-orm'

function generateRandomKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const segments: string[] = []
  for (let i = 0; i < 4; i++) {
    let segment = ''
    for (let j = 0; j < 4; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    segments.push(segment)
  }
  return segments.join('-')
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { courseId?: number, count?: number }
  const courseId = body.courseId
  const count = Math.min(Math.max(Number(body.count ?? 1), 1), 100)
  if (!courseId) return NextResponse.json({ error: 'courseId is required' }, { status: 400 })

  const exists = await db.select().from(courses).where(eq(courses.id, courseId))
  if (!exists.length) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

  const rows = Array.from({ length: count }).map(() => ({
    key: generateRandomKey(),
    courseId,
    used: false,
  }))

  const inserted = await db.insert(licenseKeys).values(rows).returning()
  return NextResponse.json(inserted)
}

