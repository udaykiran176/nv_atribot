
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { wikiPosts } from '@/db/schema';

export async function GET() {
    try {
        const categories = await db.selectDistinct({ category: wikiPosts.category }).from(wikiPosts);
        const uniqueCategories = categories.map(c => c.category).filter(Boolean);
        return NextResponse.json(uniqueCategories);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}
