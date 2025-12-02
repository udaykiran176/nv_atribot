import { NextResponse } from 'next/server'
import { db } from '@/db/drizzle'
import { licenseKeys, courses } from '@/db/schema'
import { and, eq, like, inArray } from 'drizzle-orm'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const courseIdParam = url.searchParams.get('courseId')
  const status = url.searchParams.get('status') || undefined // 'used' | 'unused' | undefined
  const search = url.searchParams.get('search') || undefined

  const courseId = courseIdParam ? Number(courseIdParam) : undefined

  let condition:
    | ReturnType<typeof eq>
    | ReturnType<typeof and>
    | ReturnType<typeof like>
    | undefined
  if (typeof courseId === 'number' && !Number.isNaN(courseId)) {
    condition = eq(licenseKeys.courseId, courseId)
  }
  if (status === 'used') {
    condition = condition ? and(condition, eq(licenseKeys.used, true)) : eq(licenseKeys.used, true)
  }
  if (status === 'unused') {
    condition = condition ? and(condition, eq(licenseKeys.used, false)) : eq(licenseKeys.used, false)
  }
  if (search) {
    const likeCond = like(licenseKeys.key, `%${search}%`)
    condition = condition ? and(condition, likeCond) : likeCond
  }

  const rows = await db.select().from(licenseKeys).where(condition).orderBy(licenseKeys.createdAt)

  const ids = Array.from(new Set(rows.map(r => r.courseId)))
  const cs = ids.length
    ? await db.select({ id: courses.id, title: courses.title }).from(courses).where(inArray(courses.id, ids))
    : []
  const courseMap = new Map(cs.map(c => [c.id, c.title] as const))

  return NextResponse.json(rows.map(r => ({ ...r, courseTitle: courseMap.get(r.courseId) ?? String(r.courseId) })))
}

