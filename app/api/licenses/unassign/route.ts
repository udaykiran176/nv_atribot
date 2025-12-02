import { NextResponse } from 'next/server'
import { db } from '@/db/drizzle'
import { licenseKeys } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: Request) {
  const { key } = await request.json().catch(() => ({})) as { key?: string }
  if (!key) return NextResponse.json({ error: 'key is required' }, { status: 400 })

  const [license] = await db.select().from(licenseKeys).where(eq(licenseKeys.key, key))
  if (!license) return NextResponse.json({ error: 'License not found' }, { status: 404 })
  if (license.used) return NextResponse.json({ error: 'Cannot unassign activated license' }, { status: 409 })

  const updated = await db.update(licenseKeys)
    .set({ assignedUserId: null })
    .where(eq(licenseKeys.key, key))
    .returning()

  return NextResponse.json(updated[0])
}

