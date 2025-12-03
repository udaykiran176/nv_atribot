"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Edit, Trash2, Plus, ArrowLeft, Video as VideoIcon } from 'lucide-react'
import Link from 'next/link'

type Video = { id: number; lessonId: number; title: string; url: string; order: number }

function SortableVideoCard({ video, onEdit, onDelete, isSaving }: { video: Video; onEdit: (v: Video) => void; onDelete: (id: number) => void; isSaving: boolean }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: video.id })
    const style = { transform: CSS.Transform.toString(transform), transition }

    return (
        <div ref={setNodeRef} style={style} className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="7" cy="5" r="1.5" fill="currentColor" />
                    <circle cx="13" cy="5" r="1.5" fill="currentColor" />
                    <circle cx="7" cy="10" r="1.5" fill="currentColor" />
                    <circle cx="13" cy="10" r="1.5" fill="currentColor" />
                    <circle cx="7" cy="15" r="1.5" fill="currentColor" />
                    <circle cx="13" cy="15" r="1.5" fill="currentColor" />
                </svg>
            </div>

            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base truncate">{video.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">URL: {video.url} • Order: {video.order}</p>
            </div>

            <div className="flex gap-2 items-center">
                <Button size="sm" variant="outline" onClick={() => onEdit(video)}>
                    <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDelete(video.id)} disabled={isSaving}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

export default function VideosPage() {
    const params = useParams()
    const router = useRouter()
    const lessonId = parseInt(params.lessonId as string)

    const [videos, setVideos] = useState<Video[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingVideo, setEditingVideo] = useState<Video | null>(null)
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')

    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

    const loadVideos = async () => {
        const res = await fetch(`/api/videos?lessonId=${lessonId}`)
        const data = await res.json()
        setVideos(Array.isArray(data) ? data.sort((a, b) => a.order - b.order) : [])
    }

    useEffect(() => { void loadVideos() }, [lessonId])

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        if (over && active.id !== over.id) {
            const oldIndex = videos.findIndex((v) => v.id === active.id)
            const newIndex = videos.findIndex((v) => v.id === over.id)
            const newVideos = arrayMove(videos, oldIndex, newIndex)
            const updatedVideos = newVideos.map((v, i) => ({ ...v, order: i + 1 }))
            setVideos(updatedVideos)

            const items = updatedVideos.map(v => ({ id: v.id, order: v.order }))
            const res = await fetch('/api/videos', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'reorder', items })
            })
            if (!res.ok) { toast('Failed to save new order'); await loadVideos() }
        }
    }

    const handleOpenDialog = (video?: Video) => {
        if (video) {
            setEditingVideo(video)
            setTitle(video.title)
            setUrl(video.url)
        } else {
            setEditingVideo(null)
            setTitle('')
            setUrl('')
        }
        setIsDialogOpen(true)
    }

    const handleSubmit = async () => {
        if (!title || !url) { toast('Please fill all fields'); return }
        setIsSaving(true)

        if (editingVideo) {
            const res = await fetch('/api/videos', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: editingVideo.id, title, url })
            })
            setIsSaving(false)
            if (res.ok) { toast('Video updated'); setIsDialogOpen(false); await loadVideos() }
            else { toast('Failed to update') }
        } else {
            const res = await fetch('/api/videos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessonId, title, url, order: videos.length + 1 })
            })
            setIsSaving(false)
            if (res.ok) { toast('Video added'); setIsDialogOpen(false); await loadVideos() }
            else { toast('Failed to create') }
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this video?')) return
        setIsSaving(true)
        const res = await fetch(`/api/videos?id=${id}`, { method: 'DELETE' })
        setIsSaving(false)
        if (res.ok) { toast('Deleted'); await loadVideos() }
        else { toast('Failed to delete') }
    }

    return (
        <div className="grid gap-6">
            <div className="flex items-center gap-4">
                <Link href={`/admin/lessons/${lessonId}/challenges`}>
                    <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <VideoIcon className="h-8 w-8" /> Videos
                    </h1>
                    <p className="text-muted-foreground">Manage video challenges for this lesson</p>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Video List</CardTitle>
                    <Button onClick={() => handleOpenDialog()}>
                        <Plus className="mr-2 h-4 w-4" /> Add Video
                    </Button>
                </CardHeader>
                <CardContent>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={videos.map(v => v.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-3">
                                {videos.map(video => <SortableVideoCard key={video.id} video={video} onEdit={handleOpenDialog} onDelete={handleDelete} isSaving={isSaving} />)}
                            </div>
                        </SortableContext>
                    </DndContext>
                    {videos.length === 0 && <div className="text-center py-12 text-muted-foreground">No videos yet</div>}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingVideo ? 'Edit Video' : 'Add Video'}</DialogTitle>
                        <DialogDescription>{editingVideo ? 'Update video details' : 'Add a new video challenge'}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input placeholder="Video title" value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>URL</Label>
                            <Input placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={isSaving}>{isSaving ? 'Saving...' : editingVideo ? 'Update' : 'Create'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
