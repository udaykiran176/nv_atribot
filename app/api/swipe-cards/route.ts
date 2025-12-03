import { NextResponse } from 'next/server'
import { db } from '@/db/drizzle'
import { swipeCards } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get('lessonId')

    if (lessonId) {
        const data = await db.select().from(swipeCards).where(eq(swipeCards.lessonId, parseInt(lessonId)))
        return NextResponse.json(data)
    }

    const data = await db.select().from(swipeCards)
    return NextResponse.json(data)
}

export async function POST(request: Request) {
    const body = await request.json()
    const [newCard] = await db.insert(swipeCards).values(body).returning()
    return NextResponse.json(newCard)
}

export async function PUT(request: Request) {
    const body = await request.json()

    if (body.type === 'reorder' && Array.isArray(body.items)) {
        try {
            for (const item of body.items) {
                await db.update(swipeCards).set({ order: item.order }).where(eq(swipeCards.id, item.id))
            }
            return NextResponse.json({ success: true })
        } catch (error) {
            return NextResponse.json({ error: 'Failed to reorder swipe cards' }, { status: 500 })
        }
    }

    const { id, ...updateData } = body
    const [updated] = await db.update(swipeCards).set(updateData).where(eq(swipeCards.id, id)).returning()
    return NextResponse.json(updated)
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
        return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    await db.delete(swipeCards).where(eq(swipeCards.id, parseInt(id)))
    return NextResponse.json({ success: true })
}
