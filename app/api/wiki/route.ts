import { NextResponse } from 'next/server';
import { db } from '@/db';
import { wikiPosts } from '@/db/schema';
import { desc, eq, ilike, or, SQL } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');
        const category = searchParams.get('category');

        // Let's do a cleaner build
        const conditionList: SQL[] = [];
        if (query) conditionList.push(or(ilike(wikiPosts.title, `%${query}%`), ilike(wikiPosts.content, `%${query}%`))!);
        if (category && category !== 'All') conditionList.push(eq(wikiPosts.category, category));

        // Use the dynamic querying capability
        const data = await db.query.wikiPosts.findMany({
            where: (table, { and }) => and(...conditionList),
            orderBy: (table, { desc }) => [desc(table.createdAt)],
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching wiki posts:', error);
        return NextResponse.json({ error: 'Failed to fetch wiki posts' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, slug, content, excerpt, category, coverImage } = body;

        // Basic validation
        if (!title || !slug || !content || !category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const [newPost] = await db.insert(wikiPosts).values({
            title,
            slug,
            content,
            excerpt,
            category,
            coverImage: coverImage || null,
        }).returning();

        return NextResponse.json(newPost);
    } catch (error) {
        console.error('Error creating wiki post:', error);
        return NextResponse.json({ error: 'Failed to create wiki post' }, { status: 500 });
    }
}
