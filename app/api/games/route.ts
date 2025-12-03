import { NextResponse } from 'next/server'
import { db } from '@/db/drizzle'
import { games } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get('lessonId')

    if (lessonId) {
        const data = await db.select().from(games).where(eq(games.lessonId, parseInt(lessonId)))
        return NextResponse.json(data)
    }

    const data = await db.select().from(games)
    return NextResponse.json(data)
}

export async function POST(request: Request) {
    const body = await request.json()
    const [newGame] = await db.insert(games).values(body).returning()
    return NextResponse.json(newGame)
}

export async function PUT(request: Request) {
    const body = await request.json()
    const { id, ...updateData } = body
    const [updated] = await db.update(games).set(updateData).where(eq(games.id, id)).returning()
    return NextResponse.json(updated)
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
        return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    await db.delete(games).where(eq(games.id, parseInt(id)))
    return NextResponse.json({ success: true })
}
