
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { wikiPosts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        // Check if id is number (for update by ID) or slug is possible too. 
        // Plan said [id]. Let's support ID.
        const id = parseInt(params.id);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const post = await db.query.wikiPosts.findFirst({
            where: eq(wikiPosts.id, id)
        });

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        return NextResponse.json(post);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const id = parseInt(params.id);
        const body = await request.json();

        const [updated] = await db.update(wikiPosts)
            .set({ ...body, updatedAt: new Date() })
            .where(eq(wikiPosts.id, id))
            .returning();

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const id = parseInt(params.id);
        await db.delete(wikiPosts).where(eq(wikiPosts.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
