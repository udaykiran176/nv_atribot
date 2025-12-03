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
import { Edit, Trash2, Plus, ArrowLeft, HelpCircle, X } from 'lucide-react'
import Link from 'next/link'

type McqQuestion = { id: number; lessonId: number; question: string; options: string[]; answer: string; order: number }

function SortableMcqCard({ mcq, onEdit, onDelete, isSaving }: { mcq: McqQuestion; onEdit: (m: McqQuestion) => void; onDelete: (id: number) => void; isSaving: boolean }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: mcq.id })
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
                <h3 className="font-semibold truncate">{mcq.question}</h3>
                <p className="text-xs text-muted-foreground mt-1">Answer: {mcq.answer} • Order: {mcq.order}</p>
            </div>

            <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => onEdit(mcq)}>
                    <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDelete(mcq.id)} disabled={isSaving}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

export default function McqPage() {
    const params = useParams()
    const lessonId = parseInt(params.lessonId as string)

    const [mcqs, setMcqs] = useState<McqQuestion[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingMcq, setEditingMcq] = useState<McqQuestion | null>(null)
    const [question, setQuestion] = useState('')
    const [options, setOptions] = useState<string[]>(['', '', '', ''])
    const [answer, setAnswer] = useState('')

    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

    const loadMcqs = async () => {
        const res = await fetch(`/api/mcq?lessonId=${lessonId}`)
        const data = await res.json()
        setMcqs(Array.isArray(data) ? data.sort((a, b) => a.order - b.order) : [])
    }

    useEffect(() => { void loadMcqs() }, [lessonId])

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        if (over && active.id !== over.id) {
            const oldIndex = mcqs.findIndex((m) => m.id === active.id)
            const newIndex = mcqs.findIndex((m) => m.id === over.id)
            const newMcqs = arrayMove(mcqs, oldIndex, newIndex)
            const updatedMcqs = newMcqs.map((m, i) => ({ ...m, order: i + 1 }))
            setMcqs(updatedMcqs)

            const items = updatedMcqs.map(m => ({ id: m.id, order: m.order }))
            const res = await fetch('/api/mcq', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'reorder', items })
            })
            if (!res.ok) { toast('Failed to save order'); await loadMcqs() }
        }
    }

    const handleOpenDialog = (mcq?: McqQuestion) => {
        if (mcq) {
            setEditingMcq(mcq)
            setQuestion(mcq.question)
            setOptions(Array.isArray(mcq.options) ? mcq.options : ['', '', '', ''])
            setAnswer(mcq.answer)
        } else {
            setEditingMcq(null)
            setQuestion('')
            setOptions(['', '', '', ''])
            setAnswer('')
        }
        setIsDialogOpen(true)
    }

    const handleSubmit = async () => {
        const filledOptions = options.filter(o => o.trim())
        if (!question || filledOptions.length < 2 || !answer) {
            toast('Question, at least 2 options, and answer are required')
            return
        }
        setIsSaving(true)

        if (editingMcq) {
            const res = await fetch('/api/mcq', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: editingMcq.id, question, options: filledOptions, answer })
            })
            setIsSaving(false)
            if (res.ok) { toast('Updated'); setIsDialogOpen(false); await loadMcqs() }
            else { toast('Failed') }
        } else {
            const res = await fetch('/api/mcq', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessonId, question, options: filledOptions, answer, order: mcqs.length + 1 })
            })
            setIsSaving(false)
            if (res.ok) { toast('Created'); setIsDialogOpen(false); await loadMcqs() }
            else { toast('Failed') }
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this question?')) return
        setIsSaving(true)
        const res = await fetch(`/api/mcq?id=${id}`, { method: 'DELETE' })
        setIsSaving(false)
        if (res.ok) { toast('Deleted'); await loadMcqs() }
        else { toast('Failed') }
    }

    const updateOption = (index: number, value: string) => {
        const newOptions = [...options]
        newOptions[index] = value
        setOptions(newOptions)
    }

    const addOption = () => setOptions([...options, ''])
    const removeOption = (index: number) => setOptions(options.filter((_, i) => i !== index))

    return (
        <div className="grid gap-6">
            <div className="flex items-center gap-4">
                <Link href={`/admin/lessons/${lessonId}/challenges`}>
                    <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <HelpCircle className="h-8 w-8" /> MCQ Questions
                    </h1>
                    <p className="text-muted-foreground">Manage multiple choice questions</p>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>MCQ Questions</CardTitle>
                    <Button onClick={() => handleOpenDialog()}>
                        <Plus className="mr-2 h-4 w-4" /> Add Question
                    </Button>
                </CardHeader>
                <CardContent>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={mcqs.map(m => m.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-3">
                                {mcqs.map(mcq => <SortableMcqCard key={mcq.id} mcq={mcq} onEdit={handleOpenDialog} onDelete={handleDelete} isSaving={isSaving} />)}
                            </div>
                        </SortableContext>
                    </DndContext>
                    {mcqs.length === 0 && <div className="text-center py-12 text-muted-foreground">No questions yet</div>}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingMcq ? 'Edit Question' : 'Add Question'}</DialogTitle>
                        <DialogDescription>{editingMcq ? 'Update question details' : 'Add a new MCQ question'}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Question</Label>
                            <Textarea rows={3} placeholder="Enter question" value={question} onChange={(e) => setQuestion(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Options</Label>
                                <Button size="sm" variant="outline" onClick={addOption}>
                                    <Plus className="h-3 w-3 mr-1" /> Add Option
                                </Button>
                            </div>
                            {options.map((opt, i) => (
                                <div key={i} className="flex gap-2">
                                    <Input placeholder={`Option ${i + 1}`} value={opt} onChange={(e) => updateOption(i, e.target.value)} />
                                    {options.length > 2 && (
                                        <Button size="icon" variant="outline" onClick={() => removeOption(i)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <Label>Correct Answer</Label>
                            <Input placeholder="Exact text of correct answer" value={answer} onChange={(e) => setAnswer(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={isSaving}>{isSaving ? 'Saving...' : editingMcq ? 'Update' : 'Create'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
