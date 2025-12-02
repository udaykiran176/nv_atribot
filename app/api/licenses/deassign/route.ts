import { NextResponse } from 'next/server'
import { db } from '@/db/drizzle'
import { licenseKeys } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'
import { isAdminUser } from '@/lib/admin'

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!isAdminUser(userId)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { key } = await request.json().catch(() => ({})) as { key?: string }
  if (!key) return NextResponse.json({ error: 'key is required' }, { status: 400 })

  const updated = await db.update(licenseKeys)
    .set({ assignedUserId: null, used: false, deactivatedAt: new Date() })
    .where(eq(licenseKeys.key, key))
    .returning()

  if (!updated.length) return NextResponse.json({ error: 'License not found' }, { status: 404 })
  return NextResponse.json(updated[0])
}

