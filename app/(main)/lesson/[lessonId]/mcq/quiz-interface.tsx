"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Trophy } from "lucide-react";

type MCQQuestion = {
    id: number;
    lessonId: number;
    question: string;
    options: any;
    answer: string;
    order: number;
    createdAt: Date;
};

export default function QuizInterface({ questions }: { questions: MCQQuestion[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [showResults, setShowResults] = useState(false);

    const currentQuestion = questions[currentIndex];
    const options = Array.isArray(currentQuestion.options)
        ? currentQuestion.options
        : [];

    const handleAnswer = (value: string) => {
        setAnswers({ ...answers, [currentIndex]: value });
    };

    const goNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const goPrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleSubmit = () => {
        setShowResults(true);
    };

    const calculateScore = () => {
        let correct = 0;
        questions.forEach((q, index) => {
            if (answers[index] === q.answer) {
                correct++;
            }
        });
        return correct;
    };

    if (showResults) {
        const score = calculateScore();
        const percentage = Math.round((score / questions.length) * 100);

        return (
            <div className="space-y-6">
                <Card className="text-center">
                    <CardContent className="p-8">
                        <Trophy className="h-20 w-20 mx-auto mb-4 text-yellow-500" />
                        <h1 className="text-3xl font-bold mb-2">Quiz Complete!</h1>
                        <p className="text-5xl font-bold text-orange-500 my-6">
                            {score}/{questions.length}
                        </p>
                        <p className="text-xl text-muted-foreground mb-6">
                            You scored {percentage}%
                        </p>
                        <Button onClick={() => { setShowResults(false); setCurrentIndex(0); setAnswers({}); }} size="lg">
                            Retake Quiz
                        </Button>
                    </CardContent>
                </Card>

                {/* Review Answers */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Review Your Answers</h2>
                    {questions.map((q, index) => {
                        const userAnswer = answers[index];
                        const isCorrect = userAnswer === q.answer;
                        const opts = Array.isArray(q.options) ? q.options : [];

                        return (
                            <Card key={q.id} className={isCorrect ? "border-green-500" : "border-red-500"}>
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-3 mb-4">
                                        {isCorrect ? (
                                            <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                                        ) : (
                                            <XCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                                        )}
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg mb-2">Question {index + 1}</h3>
                                            <p className="mb-3">{q.question}</p>
                                            <div className="space-y-2">
                                                {opts.map((option: string, optIndex: number) => (
                                                    <div
                                                        key={optIndex}
                                                        className={`p-3 rounded-lg ${option === q.answer
                                                                ? "bg-green-100 border-2 border-green-500"
                                                                : option === userAnswer
                                                                    ? "bg-red-100 border-2 border-red-500"
                                                                    : "bg-gray-50"
                                                            }`}
                                                    >
                                                        {option}
                                                        {option === q.answer && <span className="ml-2 text-green-600 font-semibold">✓ Correct</span>}
                                                        {option === userAnswer && option !== q.answer && <span className="ml-2 text-red-600 font-semibold">✗ Your answer</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Quiz Time!</h1>
                <p className="text-muted-foreground mt-2">
                    Question {currentIndex + 1} of {questions.length}
                </p>
            </div>

            <Card>
                <CardContent className="p-8">
                    <h2 className="text-xl font-semibold mb-6">{currentQuestion.question}</h2>

                    <RadioGroup
                        value={answers[currentIndex] || ""}
                        onValueChange={handleAnswer}
                    >
                        <div className="space-y-3">
                            {options.map((option: string, index: number) => (
                                <div
                                    key={index}
                                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${answers[currentIndex] === option
                                            ? "border-orange-500 bg-orange-50"
                                            : "border-gray-200 hover:border-gray-300"
                                        }`}
                                    onClick={() => handleAnswer(option)}
                                >
                                    <RadioGroupItem value={option} id={`option-${index}`} />
                                    <Label
                                        htmlFor={`option-${index}`}
                                        className="flex-1 cursor-pointer font-medium"
                                    >
                                        {option}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </RadioGroup>

                    {/* Progress */}
                    <div className="mt-8">
                        <div className="flex gap-1">
                            {questions.map((_, index) => (
                                <div
                                    key={index}
                                    className={`flex-1 h-2 rounded-full ${index < currentIndex
                                            ? "bg-green-500"
                                            : index === currentIndex
                                                ? "bg-orange-500"
                                                : "bg-gray-200"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
                <Button
                    onClick={goPrev}
                    disabled={currentIndex === 0}
                    variant="outline"
                    size="lg"
                >
                    Previous
                </Button>

                {currentIndex === questions.length - 1 ? (
                    <Button
                        onClick={handleSubmit}
                        disabled={Object.keys(answers).length !== questions.length}
                        size="lg"
                    >
                        Submit Quiz
                    </Button>
                ) : (
                    <Button onClick={goNext} size="lg">
                        Next Question
                    </Button>
                )}
            </div>
        </div>
    );
}
