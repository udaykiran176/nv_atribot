"use client"

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Edit, Trash2, Plus, Layers } from 'lucide-react'

type Course = { id: number; title: string; description: string }
type Lesson = { id: number; courseId: number; title: string; description: string; image: string | null; order: number }

function SortableLessonCard({ lesson, getCourseTitle, onEdit, onDelete, isSaving }: {
    lesson: Lesson;
    getCourseTitle: (courseId: number) => string;
    onEdit: (lesson: Lesson) => void;
    onDelete: (id: number) => void;
    isSaving: boolean
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: lesson.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div ref={setNodeRef} style={style} className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="7" cy="5" r="1.5" fill="currentColor" />
                    <circle cx="13" cy="5" r="1.5" fill="currentColor" />
                    <circle cx="7" cy="10" r="1.5" fill="currentColor" />
                    <circle cx="13" cy="10" r="1.5" fill="currentColor" />
                    <circle cx="7" cy="15" r="1.5" fill="currentColor" />
                    <circle cx="13" cy="15" r="1.5" fill="currentColor" />
                </svg>
            </div>

            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base truncate">{lesson.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">Order: {lesson.order} · Unit: {getCourseTitle(lesson.courseId)}</p>
            </div>

            <div className="flex gap-2 items-center">
                <Button size="sm" variant="outline" onClick={() => onEdit(lesson)}>
                    <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDelete(lesson.id)} disabled={isSaving}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

export default function LessonsPage() {
    const [courses, setCourses] = useState<Course[]>([])
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)

    // Dialog states
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)

    // Form states
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [image, setImage] = useState('')
    const [order, setOrder] = useState(0)
    const [dialogCourseId, setDialogCourseId] = useState<number | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const loadCourses = async () => {
        const res = await fetch('/api/courses', { cache: 'no-store' })
        const data = await res.json()
        setCourses(Array.isArray(data) ? data : [])
    }

    const loadLessons = async (courseId?: number) => {
        const url = courseId ? `/api/lessons?courseId=${courseId}` : '/api/lessons'
        const res = await fetch(url, { cache: 'no-store' })
        const data = await res.json()
        const sorted = Array.isArray(data) ? data.sort((a, b) => a.order - b.order) : []
        setLessons(sorted)
    }

    useEffect(() => {
        const t = setTimeout(() => {
            void loadCourses()
            void loadLessons()
        }, 0)
        return () => clearTimeout(t)
    }, [])

    const handleCourseChange = async (courseId: number | null) => {
        setSelectedCourseId(courseId)
        if (courseId) {
            await loadLessons(courseId)
        } else {
            await loadLessons()
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = lessons.findIndex((l) => l.id === active.id)
            const newIndex = lessons.findIndex((l) => l.id === over.id)

            const newLessons = arrayMove(lessons, oldIndex, newIndex)
            const updatedLessons = newLessons.map((lesson, index) => ({
                ...lesson,
                order: index + 1
            }))

            setLessons(updatedLessons)

            // Save new order to backend
            const items = updatedLessons.map(l => ({ id: l.id, order: l.order }))
            const res = await fetch('/api/lessons', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'reorder', items })
            })

            if (!res.ok) {
                toast('Failed to save new order')
                await loadLessons(selectedCourseId || undefined) // Reload on error
            }
        }
    }

    const handleOpenDialog = (lesson?: Lesson) => {
        if (lesson) {
            setEditingLesson(lesson)
            setTitle(lesson.title)
            setDescription(lesson.description)
            setImage(lesson.image || '')
            setOrder(lesson.order)
            setDialogCourseId(lesson.courseId)
        } else {
            setEditingLesson(null)
            setTitle('')
            setDescription('')
            setImage('')
            setOrder(0)
            setDialogCourseId(selectedCourseId)
        }
        setIsDialogOpen(true)
    }

    const handleCloseDialog = () => {
        setIsDialogOpen(false)
        setEditingLesson(null)
        setTitle('')
        setDescription('')
        setImage('')
        setOrder(0)
        setDialogCourseId(null)
    }

    const handleSubmit = async () => {
        if (!dialogCourseId || !title || !description) {
            toast('Please select a course and fill all required fields.')
            return
        }

        setIsSaving(true)

        if (editingLesson) {
            // Update existing lesson
            const res = await fetch('/api/lessons', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingLesson.id,
                    courseId: dialogCourseId,
                    title,
                    description,
                    image: image || null,
                    order
                })
            })
            setIsSaving(false)
            if (res.ok) {
                toast('Lesson updated successfully.')
                handleCloseDialog()
                await loadLessons(selectedCourseId || undefined)
            } else {
                const msg = await res.json().catch(() => ({}))
                toast(msg?.error || 'Failed to update lesson.')
            }
        } else {
            // Create new lesson
            const res = await fetch('/api/lessons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: dialogCourseId,
                    title,
                    description,
                    image: image || null,
                    order
                })
            })
            setIsSaving(false)
            if (res.ok) {
                toast('New lesson has been added.')
                handleCloseDialog()
                await loadLessons(selectedCourseId || undefined)
            } else {
                const msg = await res.json().catch(() => ({}))
                toast(msg?.error || 'Failed to create lesson.')
            }
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this lesson? All associated content will be deleted.')) return

        setIsSaving(true)
        const res = await fetch(`/api/lessons?id=${id}`, { method: 'DELETE' })
        setIsSaving(false)
        if (res.ok) {
            toast('Lesson deleted successfully.')
            await loadLessons(selectedCourseId || undefined)
        } else {
            const msg = await res.json().catch(() => ({}))
            toast(msg?.error || 'Failed to delete lesson.')
        }
    }

    const getCourseTitle = (courseId: number) => {
        return courses.find(c => c.id === courseId)?.title || `Course #${courseId}`
    }

    return (
        <div className="grid gap-6">
            <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-display">Lessons</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">Manage your lessons and their order</p>
                    </div>
                    <div className="flex gap-3 items-center">
                        <select
                            className="border-input rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                            value={selectedCourseId || ''}
                            onChange={(e) => handleCourseChange(e.target.value ? parseInt(e.target.value) : null)}
                        >
                            <option value="">All Courses</option>
                            {courses.map(c => (
                                <option key={c.id} value={c.id}>{c.title}</option>
                            ))}
                        </select>
                        <Button variant="primary" onClick={() => {
                            if (!selectedCourseId) {
                                toast('Please select a course first')
                                return
                            }
                            handleOpenDialog()
                        }}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Lesson
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={lessons.map(l => l.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-3">
                                {lessons.map(lesson => (
                                    <SortableLessonCard
                                        key={lesson.id}
                                        lesson={lesson}
                                        getCourseTitle={getCourseTitle}
                                        onEdit={handleOpenDialog}
                                        onDelete={handleDelete}
                                        isSaving={isSaving}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

                    {lessons.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            {selectedCourseId ? 'No lessons found for this course.' : 'Select a course or view all lessons.'}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingLesson ? 'Edit Lesson' : 'Create Lesson'}</DialogTitle>
                        <DialogDescription>
                            {editingLesson ? 'Update the lesson details' : 'Add a new lesson to your course'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="dialog-course">Course *</Label>
                            <select
                                id="dialog-course"
                                className="border-input w-full rounded-md border bg-transparent p-3 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                                value={dialogCourseId || ''}
                                onChange={(e) => setDialogCourseId(parseInt(e.target.value))}
                            >
                                <option value="">-- Select a Course --</option>
                                {courses.map(c => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="dialog-title">Title *</Label>
                                <Input
                                    id="dialog-title"
                                    placeholder="Introduction to Robotics"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dialog-order">Order</Label>
                                <Input
                                    id="dialog-order"
                                    type="number"
                                    placeholder="0"
                                    value={order}
                                    onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dialog-description">Description *</Label>
                            <textarea
                                id="dialog-description"
                                className="border-input w-full rounded-md border bg-transparent p-3 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                                rows={3}
                                placeholder="Lesson description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dialog-image">Image URL (optional)</Label>
                            <Input
                                id="dialog-image"
                                placeholder="https://example.com/image.jpg"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseDialog} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSubmit} disabled={isSaving}>
                            {isSaving ? 'Saving...' : editingLesson ? 'Update Lesson' : 'Create Lesson'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}