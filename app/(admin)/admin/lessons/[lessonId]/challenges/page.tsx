"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Video, CreditCard, Gamepad2, List, HelpCircle } from 'lucide-react'
import Link from 'next/link'

type Lesson = { id: number; title: string; description: string; courseId: number }
type Course = { id: number; title: string }

export default function ChallengesPage() {
    const params = useParams()
    const router = useRouter()
    const lessonId = parseInt(params.lessonId as string)

    const [lesson, setLesson] = useState<Lesson | null>(null)
    const [course, setCourse] = useState<Course | null>(null)
    const [counts, setCounts] = useState({ videos: 0, swipeCards: 0, games: 0, steps: 0, mcq: 0 })

    useEffect(() => {
        const loadData = async () => {
            const lessonRes = await fetch(`/api/lessons?id=${lessonId}`)
            const lessonsData = await lessonRes.json()
            const lessonData = lessonsData.find((l: Lesson) => l.id === lessonId)
            setLesson(lessonData)

            if (lessonData) {
                const courseRes = await fetch(`/api/courses`)
                const coursesData = await courseRes.json()
                const courseData = coursesData.find((c: Course) => c.id === lessonData.courseId)
                setCourse(courseData)
            }

            const [videosRes, cardsRes, gamesRes, stepsRes, mcqRes] = await Promise.all([
                fetch(`/api/videos?lessonId=${lessonId}`),
                fetch(`/api/swipe-cards?lessonId=${lessonId}`),
                fetch(`/api/games?lessonId=${lessonId}`),
                fetch(`/api/steps?lessonId=${lessonId}`),
                fetch(`/api/mcq?lessonId=${lessonId}`)
            ])

            const [videos, cards, games, steps, mcq] = await Promise.all([
                videosRes.json(),
                cardsRes.json(),
                gamesRes.json(),
                stepsRes.json(),
                mcqRes.json()
            ])

            setCounts({
                videos: videos.length,
                swipeCards: cards.length,
                games: games.length,
                steps: steps.length,
                mcq: mcq.length
            })
        }

        void loadData()
    }, [lessonId])

    const challengeTypes = [
        { name: 'Videos', icon: Video, count: counts.videos, href: `/admin/lessons/${lessonId}/videos`, color: 'bg-red-500' },
        { name: 'Swipe Cards', icon: CreditCard, count: counts.swipeCards, href: `/admin/lessons/${lessonId}/swipe-cards`, color: 'bg-blue-500' },
        { name: 'Games', icon: Gamepad2, count: counts.games, href: `/admin/lessons/${lessonId}/games`, color: 'bg-green-500' },
        { name: 'Step-by-Step', icon: List, count: counts.steps, href: `/admin/lessons/${lessonId}/steps`, color: 'bg-purple-500' },
        { name: 'MCQ Questions', icon: HelpCircle, count: counts.mcq, href: `/admin/lessons/${lessonId}/mcq`, color: 'bg-orange-500' }
    ]

    return (
        <div className="grid gap-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/lessons">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">{lesson?.title || 'Lesson Challenges'}</h1>
                    <p className="text-muted-foreground">{course?.title} • Manage all challenge types</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {challengeTypes.map((type) => {
                    const Icon = type.icon
                    return (
                        <Card key={type.name} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(type.href)}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`${type.color} p-3 rounded-lg`}>
                                            <Icon className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">{type.name}</h3>
                                            <p className="text-sm text-muted-foreground">{type.count} item{type.count !== 1 ? 's' : ''}</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">Manage</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
