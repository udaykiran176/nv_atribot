import { NextResponse } from 'next/server'
import { db } from '@/db/drizzle'
import { steps } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get('lessonId')

    if (lessonId) {
        const data = await db.select().from(steps).where(eq(steps.lessonId, parseInt(lessonId)))
        return NextResponse.json(data)
    }

    const data = await db.select().from(steps)
    return NextResponse.json(data)
}

export async function POST(request: Request) {
    const body = await request.json()
    const [newStep] = await db.insert(steps).values(body).returning()
    return NextResponse.json(newStep)
}

export async function PUT(request: Request) {
    const body = await request.json()

    if (body.type === 'reorder' && Array.isArray(body.items)) {
        try {
            for (const item of body.items) {
                await db.update(steps).set({ order: item.order }).where(eq(steps.id, item.id))
            }
            return NextResponse.json({ success: true })
        } catch (error) {
            return NextResponse.json({ error: 'Failed to reorder steps' }, { status: 500 })
        }
    }

    const { id, ...updateData } = body
    const [updated] = await db.update(steps).set(updateData).where(eq(steps.id, id)).returning()
    return NextResponse.json(updated)
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
        return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    await db.delete(steps).where(eq(steps.id, parseInt(id)))
    return NextResponse.json({ success: true })
}
