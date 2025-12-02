import { NextResponse } from 'next/server'
import { db } from '@/db/drizzle'
import { licenseKeys, courses } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { key } = await request.json().catch(() => ({})) as { key?: string }
  if (!key) return NextResponse.json({ error: 'key is required' }, { status: 400 })

  const existingActive = await db.select().from(licenseKeys).where(and(eq(licenseKeys.assignedUserId, userId), eq(licenseKeys.used, true)))
  if (existingActive.length) return NextResponse.json({ error: 'User already has an active license' }, { status: 409 })

  const [license] = await db.select().from(licenseKeys).where(eq(licenseKeys.key, key))
  if (!license) return NextResponse.json({ error: 'License not found' }, { status: 404 })
  if (license.used) return NextResponse.json({ error: 'License already activated' }, { status: 409 })
  if (license.assignedUserId && license.assignedUserId !== userId) return NextResponse.json({ error: 'License assigned to another user' }, { status: 403 })

  const updated = await db.update(licenseKeys)
    .set({ used: true, assignedUserId: userId, activatedAt: new Date(), deactivatedAt: null })
    .where(eq(licenseKeys.key, key))
    .returning()

  const [course] = await db.select().from(courses).where(eq(courses.id, updated[0].courseId))
  return NextResponse.json({ license: updated[0], course })
}

