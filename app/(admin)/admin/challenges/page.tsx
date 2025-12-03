"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Video, CreditCard, Gamepad2, List, HelpCircle, BookOpen, Search } from 'lucide-react'
import Link from 'next/link'


type Lesson = { id: number; title: string; courseId: number }
type Course = { id: number; title: string }
type ChallengeCounts = { videos: number; swipeCards: number; games: number; steps: number; mcq: number }

export default function AllChallengesPage() {
    const router = useRouter()
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [courses, setCourses] = useState<Course[]>([])
    const [counts, setCounts] = useState<Record<number, ChallengeCounts>>({})
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const load = async () => {
            const [lessonsRes, coursesRes] = await Promise.all([
                fetch('/api/lessons'),
                fetch('/api/courses')
            ])
            const lessonsData = await lessonsRes.json()
            const coursesData = await coursesRes.json()
            setLessons(Array.isArray(lessonsData) ? lessonsData : [])
            setCourses(Array.isArray(coursesData) ? coursesData : [])

            const countsData: Record<number, ChallengeCounts> = {}
            for (const lesson of (Array.isArray(lessonsData) ? lessonsData : [])) {
                const [videosRes, cardsRes, gamesRes, stepsRes, mcqRes] = await Promise.all([
                    fetch(`/api/videos?lessonId=${lesson.id}`),
                    fetch(`/api/swipe-cards?lessonId=${lesson.id}`),
                    fetch(`/api/games?lessonId=${lesson.id}`),
                    fetch(`/api/steps?lessonId=${lesson.id}`),
                    fetch(`/api/mcq?lessonId=${lesson.id}`)
                ])
                const [videos, cards, games, steps, mcq] = await Promise.all([
                    videosRes.json(),
                    cardsRes.json(),
                    gamesRes.json(),
                    stepsRes.json(),
                    mcqRes.json()
                ])
                countsData[lesson.id] = {
                    videos: Array.isArray(videos) ? videos.length : 0,
                    swipeCards: Array.isArray(cards) ? cards.length : 0,
                    games: Array.isArray(games) ? games.length : 0,
                    steps: Array.isArray(steps) ? steps.length : 0,
                    mcq: Array.isArray(mcq) ? mcq.length : 0
                }
            }
            setCounts(countsData)
        }
        void load()
    }, [])

    const getCourseTitle = (courseId: number) => courses.find(c => c.id === courseId)?.title || `Course #${courseId}`

    return (
        <div className="grid gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">All Challenges</h1>
                    <p className="text-muted-foreground">Manage challenges across all lessons</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search lessons..."
                            className="border-input rounded-md border bg-transparent pl-9 pr-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className="border-input rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                        value={selectedCourseId || ''}
                        onChange={(e) => setSelectedCourseId(e.target.value ? parseInt(e.target.value) : null)}
                    >
                        <option value="">All Courses</option>
                        {courses.map(c => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid gap-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
                {lessons
                    .filter(lesson => !selectedCourseId || lesson.courseId === selectedCourseId)
                    .filter(lesson => !searchQuery || lesson.title.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((lesson) => {
                        const lessonCounts = counts[lesson.id] || { videos: 0, swipeCards: 0, games: 0, steps: 0, mcq: 0 }
                        const total = lessonCounts.videos + lessonCounts.swipeCards + lessonCounts.games + lessonCounts.steps + lessonCounts.mcq

                        return (
                            <Card key={lesson.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-blue-500 p-3 rounded-lg">
                                                <BookOpen className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg">{lesson.title}</h3>
                                                <p className="text-sm text-muted-foreground">{getCourseTitle(lesson.courseId)} • {total} total challenges</p>
                                                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Video className="h-3 w-3" /> {lessonCounts.videos}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <CreditCard className="h-3 w-3" /> {lessonCounts.swipeCards}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Gamepad2 className="h-3 w-3" /> {lessonCounts.games}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <List className="h-3 w-3" /> {lessonCounts.steps}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <HelpCircle className="h-3 w-3" /> {lessonCounts.mcq}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button onClick={() => router.push(`/admin/lessons/${lesson.id}/challenges`)}>
                                            Manage
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                {lessons.filter(lesson => !selectedCourseId || lesson.courseId === selectedCourseId).filter(lesson => !searchQuery || lesson.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        {selectedCourseId
                            ? 'No lessons found for this course.'
                            : <>No lessons found. <Link href="/admin/lessons" className="text-primary underline">Create a lesson first</Link></>
                        }
                    </div>
                )}
            </div>
        </div>
    )
}
