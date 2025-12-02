import { NextResponse } from 'next/server'
import { db } from '@/db/drizzle'
import { licenseKeys } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'

export async function POST() {
  const { userId } =  await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [active] = await db.select().from(licenseKeys).where(and(eq(licenseKeys.assignedUserId, userId), eq(licenseKeys.used, true)))
  if (!active) return NextResponse.json({ error: 'No active license' }, { status: 404 })

  const updated = await db.update(licenseKeys)
    .set({ used: false, deactivatedAt: new Date() })
    .where(eq(licenseKeys.id, active.id))
    .returning()

  return NextResponse.json(updated[0])
}

