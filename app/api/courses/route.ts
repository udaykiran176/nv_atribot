import { NextResponse } from 'next/server'
import { db } from '@/db/drizzle'
import { courses } from '@/db/schema'
import { auth } from '@clerk/nextjs/server'
import { isAdminUser } from '@/lib/admin'
import { eq } from 'drizzle-orm'

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

export async function PUT(request: Request) {
  const { userId } = await auth()
  if (!isAdminUser(userId)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({})) as {
    type?: string,
    items?: { id: number, order: number }[],
    id?: number,
    title?: string,
    description?: string
  }

  // Handle batch reorder
  if (body.type === 'reorder' && Array.isArray(body.items)) {
    try {
      for (const item of body.items) {
        await db.update(courses).set({ order: item.order }).where(eq(courses.id, item.id))
      }
      return NextResponse.json({ success: true })
    } catch (error) {
      return NextResponse.json({ error: 'Failed to reorder courses' }, { status: 500 })
    }
  }

  // Handle single course update
  const id = body.id
  const title = body.title?.trim()
  const description = body.description?.trim()

  if (!id || !title || !description) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const [updated] = await db.update(courses).set({ title, description }).where(eq(courses.id, id)).returning()
  if (!updated) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

  return NextResponse.json(updated)
}

export async function DELETE(request: Request) {
  const { userId } = await auth()
  if (!isAdminUser(userId)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'Missing course ID' }, { status: 400 })

  const [deleted] = await db.delete(courses).where(eq(courses.id, parseInt(id))).returning()
  if (!deleted) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

  return NextResponse.json({ success: true })
}
