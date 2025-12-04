"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2 } from "lucide-react";

type Game = {
    id: number;
    lessonId: number;
    title: string;
    type: string;
    data: any;
    createdAt: Date;
};

export default function GameViewer({ games }: { games: Game[] }) {
    return (
        <div className="grid gap-6">
            {games.map((game) => (
                <Card key={game.id}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Gamepad2 className="h-6 w-6 text-green-500" />
                            {game.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">Type: {game.type}</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">Game Data:</h3>
                                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                                    <code className="text-sm">{JSON.stringify(game.data, null, 2)}</code>
                                </pre>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
