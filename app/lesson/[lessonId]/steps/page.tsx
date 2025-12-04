import { db } from "@/db/drizzle";
import { steps } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import StepSlider from "./step-slider";

export default async function StepsPage({ params }: { params: Promise<{ lessonId: string }> }) {
    const { lessonId: lessonIdParam } = await params;
    const lessonId = parseInt(lessonIdParam);

    const stepsList = await db
        .select()
        .from(steps)
        .where(eq(steps.lessonId, lessonId))
        .orderBy(asc(steps.order));

    if (stepsList.length === 0) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6">
            <div className="max-w-5xl mx-auto">
                <Link href="/learn">
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Lessons
                    </Button>
                </Link>

                <StepSlider steps={stepsList} />
            </div>
        </div>
    );
}
