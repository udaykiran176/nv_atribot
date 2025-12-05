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
        <CardSlider cards={cardsList} />
    );
}
