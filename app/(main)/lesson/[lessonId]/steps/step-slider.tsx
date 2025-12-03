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
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Step-by-Step Guide</h1>
                <p className="text-muted-foreground mt-2">
                    Step {currentIndex + 1} of {steps.length}
                </p>
            </div>

            <Card className="max-w-4xl mx-auto">
                <CardContent className="p-8 min-h-[500px] flex flex-col">
                    <div className="bg-purple-500 text-white px-4 py-2 rounded-lg inline-block mb-4 self-start">
                        Step {currentIndex + 1}
                    </div>

                    <h2 className="text-2xl font-bold mb-4">{currentStep.title}</h2>

                    {currentStep.image && (
                        <div className="relative w-full h-80 mb-6 rounded-lg overflow-hidden bg-gray-100">
                            <Image
                                src={currentStep.image}
                                alt={currentStep.title}
                                fill
                                className="object-contain"
                            />
                        </div>
                    )}

                    <div className="flex-1 prose max-w-none">
                        <p className="text-lg leading-relaxed whitespace-pre-wrap">{currentStep.description}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-8">
                        <div className="flex justify-between text-sm text-muted-foreground mb-2">
                            <span>Progress</span>
                            <span>{Math.round(((currentIndex + 1) / steps.length) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-purple-500 h-2 rounded-full transition-all"
                                style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between max-w-4xl mx-auto">
                <Button
                    onClick={goPrev}
                    disabled={currentIndex === 0}
                    variant="outline"
                    size="lg"
                >
                    <ChevronLeft className="mr-2 h-5 w-5" />
                    Previous
                </Button>

                <Button
                    onClick={goNext}
                    disabled={currentIndex === steps.length - 1}
                    size="lg"
                >
                    {currentIndex === steps.length - 1 ? "Finish" : "Next"}
                    <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}
