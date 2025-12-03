"use client";

import { Video, CreditCard, Gamepad2, List, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChallengeType = 'video' | 'swipe-card' | 'game' | 'step' | 'mcq';

type LessonButtonProps = {
    id: number;
    index: number;
    totalCount: number;
    current?: boolean;
    challengeType: ChallengeType;
    challengeCount?: number;
};

const challengeConfig = {
    'video': { icon: Video, color: 'bg-red-500', hoverColor: 'hover:bg-red-600', href: 'videos', label: 'Videos' },
    'swipe-card': { icon: CreditCard, color: 'bg-blue-500', hoverColor: 'hover:bg-blue-600', href: 'swipe-cards', label: 'Swipe Cards' },
    'game': { icon: Gamepad2, color: 'bg-green-500', hoverColor: 'hover:bg-green-600', href: 'games', label: 'Games' },
    'step': { icon: List, color: 'bg-purple-500', hoverColor: 'hover:bg-purple-600', href: 'steps', label: 'Build' },
    'mcq': { icon: HelpCircle, color: 'bg-orange-500', hoverColor: 'hover:bg-orange-600', href: 'mcq', label: 'Quiz' }
};

export const LessonButton = ({
    id,
    index,
    totalCount,
    current,
    challengeType,
    challengeCount = 1,
}: LessonButtonProps) => {
    const cycleLength = 8;
    const cycleIndex = index % cycleLength;

    let indentationLevel;

    if (cycleIndex <= 2) indentationLevel = cycleIndex;
    else if (cycleIndex <= 4) indentationLevel = 4 - cycleIndex;
    else if (cycleIndex <= 6) indentationLevel = 4 - cycleIndex;
    else indentationLevel = cycleIndex - 8;

    const rightPosition = indentationLevel * 40;

    const isFirst = index === 0;

    const config = challengeConfig[challengeType];
    const Icon = config.icon;

    const href = `/lesson/${id}/${config.href}`;

    return (
        <Link href={href}>
            <div
                className="relative"
                style={{
                    right: `${rightPosition}px`,
                    marginTop: isFirst ? 60 : 24,
                }}
            >
                {current && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-10 animate-bounce rounded-xl border-2 bg-white px-3 py-2 font-bold uppercase tracking-wide text-orange-500 text-xs whitespace-nowrap">
                        Start
                        <div
                            className="absolute -bottom-2 left-1/2 h-0 w-0 -translate-x-1/2 transform border-x-8 border-t-8 border-x-transparent"
                            aria-hidden
                        />
                    </div>
                )}

                <div className="relative">
                    <Button
                        size="rounded"
                        className={cn(
                            "h-[70px] w-[70px] border-b-8 transition-colors",
                            `${config.color} ${config.hoverColor} border-gray-700`
                        )}
                    >
                        <Icon className="h-10 w-10 text-white" />
                    </Button>

                    {challengeCount && challengeCount > 1 && (
                        <div className="absolute -top-2 -right-2 bg-white border-2 border-gray-700 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold">
                            {challengeCount}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};
