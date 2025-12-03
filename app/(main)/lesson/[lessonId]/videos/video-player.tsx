"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Play } from "lucide-react";

type Video = {
    id: number;
    lessonId: number;
    title: string;
    url: string;
    order: number;
    createdAt: Date;
};

export default function VideoPlayer({ videos }: { videos: Video[] }) {
    const [activeIndex, setActiveIndex] = useState(0);

    const activeVideo = videos[activeIndex];

    // Extract YouTube video ID from URL
    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
    };

    const videoId = getYouTubeId(activeVideo.url);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Video Player */}
            <div className="lg:col-span-2">
                <Card>
                    <CardContent className="p-0">
                        <div className="aspect-video bg-black rounded-lg overflow-hidden">
                            {videoId ? (
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${videoId}`}
                                    title={activeVideo.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-white">
                                    Invalid video URL
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <h2 className="text-xl font-bold">{activeVideo.title}</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Video {activeIndex + 1} of {videos.length}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Playlist */}
            <div className="lg:col-span-1">
                <Card>
                    <CardContent className="p-4">
                        <h3 className="font-bold mb-4">Playlist ({videos.length} videos)</h3>
                        <div className="space-y-2 max-h-[600px] overflow-y-auto">
                            {videos.map((video, index) => (
                                <button
                                    key={video.id}
                                    onClick={() => setActiveIndex(index)}
                                    className={`w-full text-left p-3 rounded-lg transition-colors ${activeIndex === index
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-100 hover:bg-gray-200"
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {activeIndex === index ? (
                                                <div className="w-6 h-6 rounded-full bg-white text-blue-500 flex items-center justify-center">
                                                    <Play className="h-3 w-3" />
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold">
                                                    {index + 1}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{video.title}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
