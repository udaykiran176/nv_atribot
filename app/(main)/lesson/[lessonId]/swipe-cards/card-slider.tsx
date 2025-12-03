"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

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

    const currentCard = cards[currentIndex];

    const goNext = () => {
        if (currentIndex < cards.length - 1) {
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
                <h1 className="text-3xl font-bold">Swipe Cards</h1>
                <p className="text-muted-foreground mt-2">
                    Card {currentIndex + 1} of {cards.length}
                </p>
            </div>

            <Card className="max-w-4xl mx-auto">
                <CardContent className="p-8 min-h-[500px] flex flex-col">
                    <h2 className="text-2xl font-bold mb-4">{currentCard.title}</h2>

                    {currentCard.image && (
                        <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden bg-gray-100">
                            <Image
                                src={currentCard.image}
                                alt={currentCard.title}
                                fill
                                className="object-contain"
                            />
                        </div>
                    )}

                    <div className="flex-1 prose max-w-none">
                        <p className="text-lg leading-relaxed whitespace-pre-wrap">{currentCard.content}</p>
                    </div>

                    {/* Progress Dots */}
                    <div className="flex justify-center gap-2 mt-8">
                        {cards.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                        ? "bg-blue-500 w-8"
                                        : "bg-gray-300 hover:bg-gray-400"
                                    }`}
                            />
                        ))}
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
                    disabled={currentIndex === cards.length - 1}
                    size="lg"
                >
                    Next
                    <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}
