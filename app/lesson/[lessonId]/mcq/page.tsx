import { db } from "@/db/drizzle";
import { mcqQuestions } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuizInterface from "./quiz-interface"

export default async function MCQPage({ params }: { params: Promise<{ lessonId: string }> }) {
    const { lessonId: lessonIdParam } = await params;
    const lessonId = parseInt(lessonIdParam);

    const questionsList = await db
        .select()
        .from(mcqQuestions)
        .where(eq(mcqQuestions.lessonId, lessonId))
        .orderBy(asc(mcqQuestions.order));

    if (questionsList.length === 0) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 p-6">
            <div className="max-w-4xl mx-auto">
                <Link href="/learn">
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Lessons
                    </Button>
                </Link>

                <QuizInterface questions={questionsList} />
            </div>
        </div>
    );
}
