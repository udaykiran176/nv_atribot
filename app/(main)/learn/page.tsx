import { Header } from "./components/header";
import { FeedWrapper } from "./components/feed-wrapper";
import { StickyWrapper } from "./components/sticky-wrapper";
import { LessonNav } from "./components/lesson-nav";
import { db } from "@/db/drizzle";
import { licenseKeys, courses, lessons as lessonsTable, videos, swipeCards, games, steps, mcqQuestions } from "@/db/schema";
import { and, eq, desc, asc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { LearnContent } from "./components/learn-content";

type Challenge = {
  id: number;
  type: 'video' | 'swipe-card' | 'game' | 'step' | 'mcq';
  order: number;
  completed: boolean;
  count?: number;
};

export default async function Learn() {
  const { userId } = await auth();

  let courseTitle = "Your Course";
  let lessons: Array<{
    id: number;
    title: string;
    description: string;
    order: number;
    challenges: Challenge[];
  }> = [];

  let activeChallenge: {
    id: number;
    type: string;
    lessonId: number;
  } | null = null;

  if (userId) {
    const [activeLicense] = await db
      .select()
      .from(licenseKeys)
      .where(and(eq(licenseKeys.assignedUserId, userId), eq(licenseKeys.used, true)))
      .orderBy(desc(licenseKeys.activatedAt))
      .limit(1);

    if (activeLicense) {
      const [course] = await db
        .select()
        .from(courses)
        .where(eq(courses.id, activeLicense.courseId))
        .limit(1);

      if (course) {
        courseTitle = course.title;

        const courseLessons = await db
          .select()
          .from(lessonsTable)
          .where(eq(lessonsTable.courseId, course.id))
          .orderBy(asc(lessonsTable.order));

        for (const lesson of courseLessons) {
          const [videosData, swipeCardsData, gamesData, stepsData, mcqData] = await Promise.all([
            db.select().from(videos).where(eq(videos.lessonId, lesson.id)).orderBy(asc(videos.order)),
            db.select().from(swipeCards).where(eq(swipeCards.lessonId, lesson.id)).orderBy(asc(swipeCards.order)),
            db.select().from(games).where(eq(games.lessonId, lesson.id)),
            db.select().from(steps).where(eq(steps.lessonId, lesson.id)).orderBy(asc(steps.order)),
            db.select().from(mcqQuestions).where(eq(mcqQuestions.lessonId, lesson.id)).orderBy(asc(mcqQuestions.order))
          ]);

          // Create one challenge button per type (if that type has any items)
          const allChallenges: Challenge[] = [];
          let orderCounter = 0;

          if (videosData.length > 0) {
            allChallenges.push({
              id: lesson.id,
              type: 'video' as const,
              order: orderCounter++,
              completed: false,
              count: videosData.length
            });
          }

          if (swipeCardsData.length > 0) {
            allChallenges.push({
              id: lesson.id,
              type: 'swipe-card' as const,
              order: orderCounter++,
              completed: false,
              count: swipeCardsData.length
            });
          }

          if (gamesData.length > 0) {
            allChallenges.push({
              id: lesson.id,
              type: 'game' as const,
              order: orderCounter++,
              completed: false,
              count: gamesData.length
            });
          }

          if (stepsData.length > 0) {
            allChallenges.push({
              id: lesson.id,
              type: 'step' as const,
              order: orderCounter++,
              completed: false,
              count: stepsData.length
            });
          }

          if (mcqData.length > 0) {
            allChallenges.push({
              id: lesson.id,
              type: 'mcq' as const,
              order: orderCounter++,
              completed: false,
              count: mcqData.length
            });
          }

          lessons.push({
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            order: lesson.order,
            challenges: allChallenges
          });

          if (!activeChallenge && allChallenges.length > 0) {
            const firstIncomplete = allChallenges.find(c => !c.completed);
            if (firstIncomplete) {
              activeChallenge = {
                id: firstIncomplete.id,
                type: firstIncomplete.type,
                lessonId: lesson.id
              };
            }
          }
        }
      }
    }
  }

  const lessonList = lessons.map(lesson => ({
    id: lesson.id,
    title: lesson.title,
    order: lesson.order,
    completed: lesson.challenges.every(c => c.completed)
  }));

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <LessonNav lessons={lessonList} />
      </StickyWrapper>
      <FeedWrapper>
        <Header title={courseTitle} />
        <LearnContent
          lessons={lessons}
          activeChallenge={activeChallenge}
        />
      </FeedWrapper>
    </div>
  );
}
