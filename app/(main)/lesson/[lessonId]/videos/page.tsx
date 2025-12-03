import { db } from "@/db/drizzle";
import { videos } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoPlayer from "./video-player";

export default async function VideosPage({ params }: { params: Promise<{ lessonId: string }> }) {
    const { lessonId: lessonIdParam } = await params;
    const lessonId = parseInt(lessonIdParam);

    const videosList = await db
        .select()
        .from(videos)
        .where(eq(videos.lessonId, lessonId))
        .orderBy(asc(videos.order));

    if (videosList.length === 0) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
                <Link href="/learn">
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Lessons
                    </Button>
                </Link>

                <h1 className="text-3xl font-bold mb-6">Video Playlist</h1>

                <VideoPlayer videos={videosList} />
            </div>
        </div>
    );
}
