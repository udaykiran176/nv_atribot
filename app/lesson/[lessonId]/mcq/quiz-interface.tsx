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
            <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col overflow-y-auto">
                <div className="max-w-3xl mx-auto w-full p-6 space-y-6">
                    <Card className="text-center shadow-md">
                        <CardContent className="p-8">
                            <Trophy className="h-20 w-20 mx-auto mb-4 text-yellow-500" />
                            <h1 className="text-3xl font-bold mb-2">Quiz Complete!</h1>
                            <p className="text-5xl font-bold text-orange-500 my-6">
                                {score}/{questions.length}
                            </p>
                            <p className="text-xl text-muted-foreground mb-6">
                                You scored {percentage}%
                            </p>
                            <div className="flex justify-center gap-4">
                                <Button variant="outline" asChild>
                                    <a href="/learn">Back to Lessons</a>
                                </Button>
                                <Button onClick={() => { setShowResults(false); setCurrentIndex(0); setAnswers({}); }} size="lg">
                                    Retake Quiz
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Review Answers */}
                    <div className="space-y-4 pb-12">
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
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col">
            {/* Top Bar */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
                <Button variant="primary" asChild>
                    <a href="/learn" className="flex items-center ">
                        &larr; <span className="ml-2">Exit</span>
                    </a>
                </Button>

                <div className="flex-1 max-w-xl mx-8">
                    <div className="flex justify-between text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">
                        <span>Progress</span>
                        <span>{currentIndex + 1} / {questions.length}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-orange-500 transition-all duration-300 ease-out"
                            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="w-[100px]" /> {/* Spacer */}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
                <div className="max-w-2xl w-full space-y-8">
                    <div className="text-center">
                        <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-4">
                            Question {currentIndex + 1}
                        </span>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight">
                            {currentQuestion.question}
                        </h2>
                    </div>

                    <Card className="border-0 shadow-lg overflow-hidden">
                        <CardContent className="p-0">
                            <RadioGroup
                                value={answers[currentIndex] || ""}
                                onValueChange={handleAnswer}
                                className="space-y-0 divide-y divide-slate-100"
                            >
                                {options.map((option: string, index: number) => (
                                    <div
                                        key={index}
                                        className={`flex items-center p-5 transition-all cursor-pointer hover:bg-slate-50 ${answers[currentIndex] === option
                                            ? "bg-orange-50 hover:bg-orange-50"
                                            : ""
                                            }`}
                                        onClick={() => handleAnswer(option)}
                                    >
                                        <RadioGroupItem
                                            value={option}
                                            id={`option-${index}`}
                                            className="border-2 border-slate-300 text-orange-500 data-[state=checked]:border-orange-500 mr-4 h-6 w-6"
                                        />
                                        <Label
                                            htmlFor={`option-${index}`}
                                            className="flex-1 cursor-pointer font-medium text-lg text-slate-700"
                                        >
                                            {option}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </CardContent>
                    </Card>

                    <div className="flex justify-between pt-4">
                        <Button
                            onClick={goPrev}
                            disabled={currentIndex === 0}
                            variant="ghost"
                            size="lg"
                            className="text-slate-500 hover:text-slate-900"
                        >
                            Previous
                        </Button>

                        <div className="flex gap-3">
                            {currentIndex === questions.length - 1 ? (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={Object.keys(answers).length !== questions.length}
                                    size="lg"
                                    className="bg-green-600 hover:bg-green-700 text-white min-w-[140px]"
                                >
                                    Submit Quiz
                                </Button>
                            ) : (
                                <Button
                                    onClick={goNext}
                                    size="lg"
                                    className="bg-slate-900 hover:bg-slate-800 text-white min-w-[140px]"
                                >
                                    Next Question
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
