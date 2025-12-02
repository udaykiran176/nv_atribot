import { NextResponse } from 'next/server'
import { db } from '@/db/drizzle'
import { courses, licenseKeys } from '@/db/schema'
import { sql, and, eq } from 'drizzle-orm'

export async function GET() {
  const coursesCountRows = await db.select({ count: sql<number>`COUNT(*)::int` }).from(courses)
  const licenseCountRows = await db.select({ count: sql<number>`COUNT(*)::int` }).from(licenseKeys)
  const activeUsersRows = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${licenseKeys.assignedUserId})::int` })
    .from(licenseKeys)
    .where(and(eq(licenseKeys.used, true)))

  const totalCourses = coursesCountRows[0]?.count ?? 0
  const totalLicenseKeys = licenseCountRows[0]?.count ?? 0
  const activeUsers = activeUsersRows[0]?.count ?? 0

  return NextResponse.json({ totalCourses, totalLicenseKeys, activeUsers })
}

