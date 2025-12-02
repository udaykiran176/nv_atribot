import { NextResponse } from 'next/server'
import { db } from '@/db/drizzle'
import { licenseKeys } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ active: false })
  const rows = await db.select().from(licenseKeys).where(and(eq(licenseKeys.assignedUserId, userId), eq(licenseKeys.used, true)))
  const active = rows.length > 0
  return NextResponse.json({ active })
}

