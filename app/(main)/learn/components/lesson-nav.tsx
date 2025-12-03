"use client";

import { BookOpen } from "lucide-react";

type LessonNavProps = {
    lessons: Array<{
        id: number;
        title: string;
        order: number;
        completed: boolean;
    }>;
};

export const LessonNav = ({ lessons }: LessonNavProps) => {
    const handleScrollToLesson = (lessonId: number) => {
        const element = document.getElementById(`lesson-${lessonId}`);
        if (element) {
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - 80;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    return (
        <div className="rounded-xl border-2 bg-white p-4">
            <h3 className="mb-4 text-lg font-bold">Lessons</h3>
            <div className="space-y-2">
                {lessons.map((lesson) => {
                    return (
                        <button
                            key={lesson.id}
                            onClick={() => handleScrollToLesson(lesson.id)}
                            className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-gray-100 "
                                }`}
                        >
                            <BookOpen className="h-5 w-5 flex-shrink-0 text-gray-300" />
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate `}>
                                    {lesson.title}
                                </p>
                                <p className="text-xs text-gray-500">Lesson {lesson.order}</p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
