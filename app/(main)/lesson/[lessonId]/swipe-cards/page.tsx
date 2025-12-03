import { db } from "@/db/drizzle";
import { swipeCards } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CardSlider from "./card-slider"

export default async function SwipeCardsPage({ params }: { params: Promise<{ lessonId: string }> }) {
    const { lessonId: lessonIdParam } = await params;
    const lessonId = parseInt(lessonIdParam);

    const cardsList = await db
        .select()
        .from(swipeCards)
        .where(eq(swipeCards.lessonId, lessonId))
        .orderBy(asc(swipeCards.order));

    if (cardsList.length === 0) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
            <div className="max-w-5xl mx-auto">
                <Link href="/learn">
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Lessons
                    </Button>
                </Link>

                <CardSlider cards={cardsList} />
            </div>
        </div>
    );
}
