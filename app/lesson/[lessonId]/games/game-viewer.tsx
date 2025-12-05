"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2 } from "lucide-react";

type Game = {
    id: number;
    lessonId: number;
    title: string;
    component: string;
    thumbnail: string | null;
    createdAt: Date;
};

export default function GameViewer({ games }: { games: Game[] }) {
    const [activeGame, setActiveGame] = useState<Game | null>(null);
    const [GameComponent, setGameComponent] = useState<React.ComponentType | null>(null);

    useEffect(() => {
        if (activeGame) {
            setGameComponent(null);
            import(`@/components/games/${activeGame.component}`)
                .then((mod) => {
                    setGameComponent(() => mod.default);
                })
                .catch((err) => {
                    console.error("Failed to load game component:", err);
                    // Return a component that renders the error message
                    setGameComponent(() => () => <div className="p-4 text-red-500">Game component not found: {activeGame.component}</div>);
                });
        } else {
            setGameComponent(null);
        }
    }, [activeGame]);

    if (activeGame) {
        return (
            <div className="fixed inset-0 z-50 bg-white flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white shadow-sm">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Gamepad2 className="h-6 w-6 text-green-500" />
                        {activeGame.title}
                    </h2>
                    <button
                        onClick={() => setActiveGame(null)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                    >
                        Exit Game
                    </button>
                </div>
                <div className="flex-1 overflow-hidden bg-slate-50 flex items-center justify-center p-4">
                    {GameComponent ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <GameComponent />
                        </div>
                    ) : (
                        <div className="animate-pulse">Loading game...</div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
                <Card
                    key={game.id}
                    className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
                    onClick={() => setActiveGame(game)}
                >
                    <div className="aspect-video bg-slate-100 relative overflow-hidden">
                        {game.thumbnail ? (
                            <img src={game.thumbnail} alt={game.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <Gamepad2 className="h-12 w-12" />
                            </div>
                        )}
                    </div>
                    <CardHeader>
                        <CardTitle className="text-lg">{game.title}</CardTitle>
                        <p className="text-xs text-muted-foreground">Click to play</p>
                    </CardHeader>
                </Card>
            ))}
        </div>
    );
}
