"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lesson } from "./lesson";

type Challenge = {
    id: number;
    type: 'video' | 'swipe-card' | 'game' | 'step' | 'mcq';
    order: number;
    completed: boolean;
    count?: number;
};

type LearnContentProps = {
    lessons: Array<{
        id: number;
        title: string;
        description: string;
        order: number;
        challenges: Challenge[];
    }>;
    activeChallenge: {
        id: number;
        type: string;
        lessonId: number;
    } | null;
};

export function LearnContent({
    lessons,
    activeChallenge,
}: LearnContentProps) {
    return (
        <>
            {lessons.map((lesson, index) => (
                <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="mb-10"
                >
                    <Lesson
                        id={lesson.id}
                        order={lesson.order}
                        description={lesson.description}
                        title={lesson.title}
                        challenges={lesson.challenges}
                        activeChallenge={activeChallenge}
                    />
                </motion.div>
            ))}
        </>
    );
}
