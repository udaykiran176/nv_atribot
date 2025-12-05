"use client";


import Link from "next/link";
import Image from "next/image";

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
    'video': { icon: '/video-mastery.svg', hexTop: '/hex-video-top.svg', href: 'videos', label: 'Videos' },
    'swipe-card': { icon: '/swipe-mastery.svg', hexTop: '/hex-swipe-top.svg', href: 'swipe-cards', label: 'Swipe Cards' },
    'game': { icon: '/game-mastery.svg', hexTop: '/hex-game-top.svg', href: 'games', label: 'Games' },
    'step': { icon: '/build-mastery.svg', hexTop: '/hex-step-top.svg', href: 'steps', label: 'Build' },
    'mcq': { icon: '/mcq-mastery.svg', hexTop: '/hex-mcq-top.svg', href: 'mcq', label: 'Quiz' }
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
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-10 animate-bounce rounded-xl border-2 bg-white px-3 py-2 font-bold uppercase tracking-wide text-blue-500 text-xs whitespace-nowrap">
                        Start
                        <div
                            className="absolute -bottom-2 left-1/2 h-0 w-0 -translate-x-1/2 transform border-x-8 border-t-8 border-x-transparent"
                            aria-hidden
                        />
                    </div>
                )}

                <div className="relative inline-block group">
                    {/* Hexagonal Button Container */}
                    <div className="w-[72px] h-[60px] relative cursor-pointer">
                        {/* Base Layer */}
                        <Image
                            src="/hex-closed-base.svg"
                            alt=""
                            width={72}
                            height={68}
                            className="absolute top-0 left-0 z-0 pointer-events-none"
                        />

                        {/* Shadow Layer */}
                        <Image
                            src="/hex-closed-shadow.svg"
                            alt=""
                            width={56}
                            height={42}
                            className="absolute top-[8px] left-[8px] z-[2] pointer-events-none"
                        />

                        {/* Top Colored Layer - moves on hover/active */}
                        <Image
                            src={config.hexTop}
                            alt=""
                            width={56}
                            height={42}
                            className="absolute top-[-2px] left-[8px] z-[3] pointer-events-none transition-transform duration-[220ms] ease-[cubic-bezier(0.2,0.9,0.25,1)] group-hover:translate-y-[8px] group-active:translate-y-[12px] group-active:scale-[0.98]"
                            style={{ transformOrigin: 'center center' }}
                        />

                        {/* Icon Layer - moves on hover/active */}
                        <div className="absolute top-[10px] left-[22px] z-[4] pointer-events-none transition-transform duration-[220ms] ease-[cubic-bezier(0.2,0.9,0.25,1)] group-hover:translate-y-[8px] group-active:translate-y-[12px] group-active:scale-[0.98]" style={{ transformOrigin: 'center center' }}>
                            <Image
                                src={config.icon}
                                alt=""
                                width={28}
                                height={16}
                                className="w-7 h-4"
                            />
                        </div>
                    </div>

                    {/* Challenge Count Badge */}
                    {challengeCount && challengeCount > 1 && (
                        <div className="absolute -top-2 -right-2 bg-white border-2 border-gray-700 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold z-[5]">
                            {challengeCount}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};
