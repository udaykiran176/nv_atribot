import { LessonButton } from "./lesson-button";
import { LessonBanner } from "./lesson-banner";

type Challenge = {
    id: number;
    type: 'video' | 'swipe-card' | 'game' | 'step' | 'mcq';
    order: number;
    completed: boolean;
    count?: number;
};

type LessonProps = {
    id: number;
    order: number;
    title: string;
    description: string;
    challenges: Challenge[];
    activeChallenge:
    | {
        id: number;
        type: string;
        lessonId: number;
    }
    | null
    | undefined;
};

export const Lesson = ({
    id,
    title,
    description,
    challenges,
    activeChallenge,
}: LessonProps) => {
    return (
        <div id={`lesson-${id}`}>
            <LessonBanner title={title} description={description} />

            <div className="relative flex flex-col items-center">
                {challenges.map((challenge, i) => {
                    const isCurrent = challenge.id === activeChallenge?.id && challenge.type === activeChallenge?.type;

                    return (
                        <LessonButton
                            key={`${challenge.type}-${challenge.id}`}
                            id={id}
                            index={i}
                            totalCount={challenges.length - 1}
                            current={isCurrent}
                            challengeType={challenge.type}
                            challengeCount={challenge.count}
                        />
                    );
                })}
            </div>
        </div>
    );
};
