import { NextResponse } from 'next/server'
import { db } from '@/db/drizzle'
import { mcqQuestions } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get('lessonId')

    if (lessonId) {
        const data = await db.select().from(mcqQuestions).where(eq(mcqQuestions.lessonId, parseInt(lessonId)))
        return NextResponse.json(data)
    }

    const data = await db.select().from(mcqQuestions)
    return NextResponse.json(data)
}

export async function POST(request: Request) {
    const body = await request.json()
    const [newQuestion] = await db.insert(mcqQuestions).values(body).returning()
    return NextResponse.json(newQuestion)
}

export async function PUT(request: Request) {
    const body = await request.json()

    if (body.type === 'reorder' && Array.isArray(body.items)) {
        try {
            for (const item of body.items) {
                await db.update(mcqQuestions).set({ order: item.order }).where(eq(mcqQuestions.id, item.id))
            }
            return NextResponse.json({ success: true })
        } catch (error) {
            return NextResponse.json({ error: 'Failed to reorder MCQ questions' }, { status: 500 })
        }
    }

    const { id, ...updateData } = body
    const [updated] = await db.update(mcqQuestions).set(updateData).where(eq(mcqQuestions.id, id)).returning()
    return NextResponse.json(updated)
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
        return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    await db.delete(mcqQuestions).where(eq(mcqQuestions.id, parseInt(id)))
    return NextResponse.json({ success: true })
}
