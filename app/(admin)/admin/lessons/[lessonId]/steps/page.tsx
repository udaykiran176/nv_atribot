"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Edit, Trash2, Plus, ArrowLeft, List } from 'lucide-react'
import Link from 'next/link'

type Step = { id: number; lessonId: number; title: string; description: string; image: string | null; order: number }

function SortableStepCard({ step, onEdit, onDelete, isSaving }: { step: Step; onEdit: (s: Step) => void; onDelete: (id: number) => void; isSaving: boolean }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: step.id })
    const style = { transform: CSS.Transform.toString(transform), transition }

    return (
        <div ref={setNodeRef} style={style} className="bg-card border rounded-lg p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
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
                <h3 className="font-semibold truncate">{step.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{step.description} • Order: {step.order}</p>
            </div>

            <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => onEdit(step)}>
                    <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDelete(step.id)} disabled={isSaving}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

export default function StepsPage() {
    const params = useParams()
    const lessonId = parseInt(params.lessonId as string)

    const [steps, setSteps] = useState<Step[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingStep, setEditingStep] = useState<Step | null>(null)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [image, setImage] = useState('')

    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

    const loadSteps = async () => {
        const res = await fetch(`/api/steps?lessonId=${lessonId}`)
        const data = await res.json()
        setSteps(Array.isArray(data) ? data.sort((a, b) => a.order - b.order) : [])
    }

    useEffect(() => { void loadSteps() }, [lessonId])

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        if (over && active.id !== over.id) {
            const oldIndex = steps.findIndex((s) => s.id === active.id)
            const newIndex = steps.findIndex((s) => s.id === over.id)
            const newSteps = arrayMove(steps, oldIndex, newIndex)
            const updatedSteps = newSteps.map((s, i) => ({ ...s, order: i + 1 }))
            setSteps(updatedSteps)

            const items = updatedSteps.map(s => ({ id: s.id, order: s.order }))
            const res = await fetch('/api/steps', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'reorder', items })
            })
            if (!res.ok) { toast('Failed to save order'); await loadSteps() }
        }
    }

    const handleOpenDialog = (step?: Step) => {
        if (step) {
            setEditingStep(step)
            setTitle(step.title)
            setDescription(step.description)
            setImage(step.image || '')
        } else {
            setEditingStep(null)
            setTitle('')
            setDescription('')
            setImage('')
        }
        setIsDialogOpen(true)
    }

    const handleSubmit = async () => {
        if (!title || !description) { toast('Please fill required fields'); return }
        setIsSaving(true)

        if (editingStep) {
            const res = await fetch('/api/steps', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: editingStep.id, title, description, image: image || null })
            })
            setIsSaving(false)
            if (res.ok) { toast('Updated'); setIsDialogOpen(false); await loadSteps() }
            else { toast('Failed') }
        } else {
            const res = await fetch('/api/steps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessonId, title, description, image: image || null, order: steps.length + 1 })
            })
            setIsSaving(false)
            if (res.ok) { toast('Created'); setIsDialogOpen(false); await loadSteps() }
            else { toast('Failed') }
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this step?')) return
        setIsSaving(true)
        const res = await fetch(`/api/steps?id=${id}`, { method: 'DELETE' })
        setIsSaving(false)
        if (res.ok) { toast('Deleted'); await loadSteps() }
        else { toast('Failed') }
    }

    return (
        <div className="grid gap-6">
            <div className="flex items-center gap-4">
                <Link href={`/admin/lessons/${lessonId}/challenges`}>
                    <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <List className="h-8 w-8" /> Step-by-Step
                    </h1>
                    <p className="text-muted-foreground">Manage step-by-step slides</p>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Steps</CardTitle>
                    <Button onClick={() => handleOpenDialog()}>
                        <Plus className="mr-2 h-4 w-4" /> Add Step
                    </Button>
                </CardHeader>
                <CardContent>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={steps.map(s => s.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-3">
                                {steps.map(step => <SortableStepCard key={step.id} step={step} onEdit={handleOpenDialog} onDelete={handleDelete} isSaving={isSaving} />)}
                            </div>
                        </SortableContext>
                    </DndContext>
                    {steps.length === 0 && <div className="text-center py-12 text-muted-foreground">No steps yet</div>}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingStep ? 'Edit Step' : 'Add Step'}</DialogTitle>
                        <DialogDescription>{editingStep ? 'Update step details' : 'Add a new step'}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input placeholder="Step title" value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea rows={4} placeholder="Step description" value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Image URL (optional)</Label>
                            <Input placeholder="https://..." value={image} onChange={(e) => setImage(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={isSaving}>{isSaving ? 'Saving...' : editingStep ? 'Update' : 'Create'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
