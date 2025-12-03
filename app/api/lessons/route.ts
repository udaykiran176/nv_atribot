import { NextResponse } from 'next/server'
import { db } from '@/db/drizzle'
import { lessons } from '@/db/schema'
import { auth } from '@clerk/nextjs/server'
import { isAdminUser } from '@/lib/admin'
import { eq } from 'drizzle-orm'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (courseId) {
        const filtered = await db.select().from(lessons).where(eq(lessons.courseId, parseInt(courseId))).orderBy(lessons.order)
        return NextResponse.json(filtered)
    }

    const all = await db.select().from(lessons).orderBy(lessons.courseId, lessons.order)
    return NextResponse.json(all)
}

export async function POST(request: Request) {
    const { userId } = await auth()
    if (!isAdminUser(userId)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json().catch(() => ({})) as { courseId?: number, title?: string, description?: string, image?: string, order?: number }
    const courseId = body.courseId
    const title = body.title?.trim()
    const description = body.description?.trim()
    const image = body.image?.trim() || null
    const order = body.order || 0

    if (!courseId || !title || !description) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

    const [created] = await db.insert(lessons).values({ courseId, title, description, image, order }).returning()
    return NextResponse.json(created)
}

export async function PUT(request: Request) {
    const { userId } = await auth()
    if (!isAdminUser(userId)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json().catch(() => ({})) as {
        type?: string,
        items?: { id: number, order: number }[],
        id?: number,
        courseId?: number,
        title?: string,
        description?: string,
        image?: string,
        order?: number
    }

    // Handle batch reorder
    if (body.type === 'reorder' && Array.isArray(body.items)) {
        try {
            for (const item of body.items) {
                await db.update(lessons).set({ order: item.order }).where(eq(lessons.id, item.id))
            }
            return NextResponse.json({ success: true })
        } catch (error) {
            return NextResponse.json({ error: 'Failed to reorder lessons' }, { status: 500 })
        }
    }

    // Handle single lesson update
    const id = body.id
    const courseId = body.courseId
    const title = body.title?.trim()
    const description = body.description?.trim()
    const image = body.image?.trim() || null
    const order = body.order

    if (!id || !courseId || !title || !description || order === undefined) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

    const [updated] = await db.update(lessons).set({ courseId, title, description, image, order, updatedAt: new Date() }).where(eq(lessons.id, id)).returning()
    if (!updated) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })

    return NextResponse.json(updated)
}

export async function DELETE(request: Request) {
    const { userId } = await auth()
    if (!isAdminUser(userId)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'Missing lesson ID' }, { status: 400 })

    const [deleted] = await db.delete(lessons).where(eq(lessons.id, parseInt(id))).returning()
    if (!deleted) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })

    return NextResponse.json({ success: true })
}
