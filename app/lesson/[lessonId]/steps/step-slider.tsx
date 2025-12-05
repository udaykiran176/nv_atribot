"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

type Step = {
    id: number;
    lessonId: number;
    title: string;
    description: string;
    image: string | null;
    order: number;
    createdAt: Date;
};

export default function StepSlider({ steps }: { steps: Step[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const currentStep = steps[currentIndex];

    const goNext = () => {
        if (currentIndex < steps.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const goPrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black text-white flex flex-col">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                <Button
                    variant="primary"
                    asChild
                >
                    <a href="/learn">
                        <ChevronLeft className="mr-2 h-6 w-6" />
                        Exit
                    </a>
                </Button>

                <div className="text-sm font-medium opacity-80">
                    Step {currentIndex + 1} / {steps.length}
                </div>

                <div className="w-20" /> {/* Spacer for balance */}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                {/* Navigation Buttons (Sides) */}
                <Button
                    onClick={goPrev}
                    disabled={currentIndex === 0}
                    variant="ghost"
                    className="absolute left-4 z-10 text-white hover:bg-white/10 disabled:opacity-0 w-16 h-16 rounded-full p-0 flex items-center justify-center transition-opacity"
                >
                    <ChevronLeft className="h-10 w-10" />
                </Button>

                <Button
                    onClick={goNext}
                    disabled={currentIndex === steps.length - 1}
                    variant="ghost"
                    className="absolute right-4 z-10 text-white hover:bg-white/10 disabled:opacity-0 w-16 h-16 rounded-full p-0 flex items-center justify-center transition-opacity"
                >
                    <ChevronRight className="h-10 w-10" />
                </Button>

                {/* Image */}
                {currentStep.image ? (
                    <div className="relative w-full h-full p-4 md:p-12">
                        <Image
                            src={currentStep.image}
                            alt={currentStep.title}
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                ) : (
                    <div className="text-slate-500 flex flex-col items-center">
                        <span className="text-8xl mb-4">🖼️</span>
                        <p className="text-xl">No image for this step</p>
                    </div>
                )}

                {/* Caption Overlay - Toggleable or Always Bottom */}
                <div className="absolute bottom-12 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none">
                    <div className="max-w-4xl mx-auto text-center pointer-events-auto">
                        <h2 className="text-2xl md:text-4xl font-bold mb-4 drop-shadow-md">{currentStep.title}</h2>
                        {currentStep.description && (
                            <p className="text-base md:text-lg text-white/90 drop-shadow-sm max-w-3xl mx-auto leading-relaxed">
                                {currentStep.description}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Progress Bar (Bottom Edge) */}
            <div className="h-1 bg-white/20 w-full">
                <div
                    className="h-full bg-purple-500 transition-all duration-300 ease-out"
                    style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
                />
            </div>
        </div>
    );
}
