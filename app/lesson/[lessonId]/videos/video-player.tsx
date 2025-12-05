"use client";
import { useState, useEffect } from "react";
import { Play, CheckCircle } from "lucide-react";
import MuxPlayer from "@mux/mux-player-react";
import { cn } from "@/lib/utils";

type Video = {
    id: number;
    lessonId: number;
    title: string;
    url: string;
    order: number;
    createdAt: Date;
};

type Lesson = {
    id: number;
    title: string;
    description: string;
};

export default function VideoPlayer({ videos, lesson }: { videos: Video[], lesson: Lesson }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const activeVideo = videos[activeIndex];

    // Extract Mux playback ID from various formats
    const getMuxPlaybackId = (url: string) => {
        if (!url) return '';
        let playbackId = url.replace(/\.m3u8$/, '');
        if (playbackId.includes('stream.mux.com/')) {
            const parts = playbackId.split('/');
            playbackId = parts[parts.length - 1];
        }
        return playbackId.trim();
    };

    const playbackId = getMuxPlaybackId(activeVideo?.url);

    const onEnded = () => {
        if (activeIndex < videos.length - 1) {
            setActiveIndex(activeIndex + 1);
        }
    };

    if (!isClient) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6">
            {/* Main Content Area */}
            <div>
                <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg mb-6">
                    {playbackId ? (
                        <MuxPlayer
                            playbackId={playbackId}
                            metadata={{
                                video_title: activeVideo.title,
                                video_series: lesson.title,
                            }}
                            streamType="on-demand"
                            className="w-full h-full"
                            onEnded={onEnded}
                            autoPlay={false}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-white bg-slate-900">
                            <p>Select a video to start playing</p>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <h1 className="text-2xl font-bold text-slate-900">{activeVideo?.title || lesson.title}</h1>
                    <p className="text-slate-600 leading-relaxed">
                        {lesson.description}
                    </p>
                </div>
            </div>

            {/* Playlist Sidebar */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-fit max-h-[calc(100vh-100px)]">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-semibold text-slate-900">Lesson Content</h3>
                    <p className="text-sm text-slate-500 mt-1">{videos.length} lessons</p>
                </div>

                <div className="overflow-y-auto custom-scrollbar">
                    {videos.map((video, index) => {
                        const videoPlaybackId = getMuxPlaybackId(video.url);
                        const isActive = activeIndex === index;
                        const isCompleted = index < activeIndex;

                        return (
                            <button
                                key={video.id}
                                onClick={() => setActiveIndex(index)}
                                className={cn(
                                    "w-full flex items-start gap-3 p-4 text-left transition-all hover:bg-slate-50 border-b border-slate-100 last:border-0",
                                    isActive && "bg-blue-50/80 hover:bg-blue-50 border-l-4 border-l-blue-500 pl-[13px]"
                                )}
                            >
                                <div className="relative flex-shrink-0 w-24 aspect-video bg-slate-200 rounded-md overflow-hidden group">
                                    {videoPlaybackId ? (
                                        <img
                                            src={`https://image.mux.com/${videoPlaybackId}/thumbnail.jpg?width=200`}
                                            alt={video.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                            <Play className="w-6 h-6 text-slate-300" />
                                        </div>
                                    )}

                                    {isActive && (
                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                                                <Play className="w-3 h-3 text-blue-600 fill-blue-600 ml-0.5" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 py-1">
                                    <h4 className={cn(
                                        "text-sm font-medium leading-tight mb-1",
                                        isActive ? "text-blue-700" : "text-slate-700"
                                    )}>
                                        {video.title}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500">Video {index + 1}</span>
                                        {isCompleted && (
                                            <CheckCircle className="w-3 h-3 text-green-500" />
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
