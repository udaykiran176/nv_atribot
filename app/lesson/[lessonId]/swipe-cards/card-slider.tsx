"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence, PanInfo } from "framer-motion";

type SwipeCard = {
    id: number;
    lessonId: number;
    title: string;
    content: string;
    image: string | null;
    order: number;
    createdAt: Date;
};

export default function CardSlider({ cards }: { cards: SwipeCard[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const currentCard = cards[currentIndex];

    const goNext = () => {
        if (currentIndex < cards.length - 1) {
            setDirection(1);
            setCurrentIndex(currentIndex + 1);
        }
    };

    const goPrev = () => {
        if (currentIndex > 0) {
            setDirection(-1);
            setCurrentIndex(currentIndex - 1);
        }
    };

    const onDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.x < -100 && currentIndex < cards.length - 1) {
            goNext();
        } else if (info.offset.x > 100 && currentIndex > 0) {
            goPrev();
        }
    };

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.95,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.95,
        }),
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col overflow-hidden">
            {/* Top Bar */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-20">
                <Button variant="primary" asChild >
                    <a href="/learn" className="flex items-center">
                        &larr; <span className="ml-2">Exit</span>
                    </a>
                </Button>

                <div className="flex-1 max-w-xl mx-8">
                    <div className="flex justify-between text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">
                        <span>Progress</span>
                        <span>{currentIndex + 1} / {cards.length}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-300 ease-out"
                            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="w-[100px]" /> {/* Spacer */}
            </div>

            <div className="flex-1 relative flex items-center justify-center p-4">
                {/* Desktop Navigation Buttons - Left */}
                <div className="hidden md:flex absolute left-8 z-10">
                    <Button
                        onClick={goPrev}
                        disabled={currentIndex === 0}
                        variant="secondary"
                        size="icon"
                        className="h-16 w-16 rounded-full shadow-lg bg-white/90 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-all hover:scale-105"
                    >
                        <ChevronLeft className="h-8 w-8 text-slate-700" />
                    </Button>
                </div>

                <div className="w-full max-w-5xl h-[70vh] relative perspective-1000">
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                        <motion.div
                            key={currentIndex}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 },
                            }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={1}
                            onDragEnd={onDragEnd}
                            className="absolute w-full h-full cursor-grab active:cursor-grabbing"
                            style={{ position: 'absolute' }}
                        >
                            <Card className="w-full h-full bg-white shadow-2xl rounded-3xl overflow-hidden border-0 ring-1 ring-slate-900/5">
                                <CardContent className="p-0 h-full flex flex-col md:flex-row">
                                    {/* Image Section */}
                                    <div className="w-full md:w-1/2 h-2/5 md:h-full relative bg-slate-50 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-100">
                                        {currentCard.image ? (
                                            <div className="relative w-full h-full p-8">
                                                <Image
                                                    src={currentCard.image}
                                                    alt={currentCard.title}
                                                    fill
                                                    className="object-contain"
                                                    priority
                                                />
                                            </div>
                                        ) : (
                                            <div className="text-gray-400 font-medium flex flex-col items-center gap-2">
                                                <span className="text-4xl">🖼️</span>
                                                <span>No Image</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Section */}
                                    <div className="w-full md:w-1/2 h-3/5 md:h-full p-8 md:p-12 flex flex-col justify-center bg-white overflow-y-auto">
                                        <div className="max-w-md mx-auto w-full">
                                            <h2 className="text-2xl md:text-4xl font-bold mb-6 text-slate-900 leading-tight">
                                                {currentCard.title}
                                            </h2>
                                            <div className="prose prose-lg prose-slate max-w-none">
                                                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                                    {currentCard.content}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Mobile Progress Dots (inside card for better layout) */}
                                        <div className="flex justify-center gap-2 mt-auto pt-8 md:hidden">
                                            {cards.map((_, index) => (
                                                <div
                                                    key={index}
                                                    className={`h-1.5 rounded-full transition-all duration-300 ${index === currentIndex
                                                        ? "bg-slate-900 w-6"
                                                        : "bg-slate-200 w-1.5"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Desktop Navigation Buttons - Right */}
                <div className="hidden md:flex absolute right-8 z-10">
                    <Button
                        onClick={goNext}
                        disabled={currentIndex === cards.length - 1}
                        variant="secondary"
                        size="icon"
                        className="h-16 w-16 rounded-full shadow-lg bg-white/90 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-all hover:scale-105"
                    >
                        <ChevronRight className="h-8 w-8 text-slate-700" />
                    </Button>
                </div>
            </div>

            {/* Hint / Instructions */}
            <div className="text-center pb-6 text-slate-400 text-sm font-medium animate-pulse">
                Swipe left or right to navigate
            </div>
        </div>
    );
}
