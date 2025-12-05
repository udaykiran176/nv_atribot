import { db } from "@/db/drizzle";
import { videos, lessons } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoPlayer from "./video-player";

export default async function VideosPage({ params }: { params: Promise<{ lessonId: string }> }) {
    const { lessonId: lessonIdParam } = await params;
    const lessonId = parseInt(lessonIdParam);

    const [lessonData] = await db
        .select()
        .from(lessons)
        .where(eq(lessons.id, lessonId));

    if (!lessonData) {
        notFound();
    }

    const videosList = await db
        .select()
        .from(videos)
        .where(eq(videos.lessonId, lessonId))
        .orderBy(asc(videos.order));

    return (
        <div className="min-h-screen bg-red-50">
            <div className="max-w-7xl mx-auto px-4 py-4">
                <Link href="/learn" className="inline-block mb-6">
                    <Button variant="primary">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Exit
                    </Button>
                </Link>

                <VideoPlayer lesson={lessonData} videos={videosList} />
            </div>
        </div>
    );
}
