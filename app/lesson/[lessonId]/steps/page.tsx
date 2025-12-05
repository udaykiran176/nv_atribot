import { db } from "@/db/drizzle";
import { steps } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
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
        <StepSlider steps={stepsList} />
    );
}
