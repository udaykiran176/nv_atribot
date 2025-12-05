import { db } from "@/db/drizzle";
import { games } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import GameViewer from "./game-viewer"

export default async function GamesPage({ params }: { params: Promise<{ lessonId: string }> }) {
    const { lessonId: lessonIdParam } = await params;
    const lessonId = parseInt(lessonIdParam);

    const gamesList = await db
        .select()
        .from(games)
        .where(eq(games.lessonId, lessonId));

    if (gamesList.length === 0) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
            <div className="max-w-6xl mx-auto">
                <Link href="/learn">
                    <Button variant="primary" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Exit
                    </Button>
                </Link>

                <h1 className="text-3xl font-bold mb-6">Games</h1>

                <GameViewer games={gamesList} />
            </div>
        </div>
    );
}
