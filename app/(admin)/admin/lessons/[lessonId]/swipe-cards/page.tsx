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
import { Edit, Trash2, Plus, ArrowLeft, CreditCard } from 'lucide-react'
import Link from 'next/link'

type SwipeCard = { id: number; lessonId: number; title: string; content: string; image: string | null; order: number }

function SortableCard({ card, onEdit, onDelete, isSaving }: { card: SwipeCard; onEdit: (c: SwipeCard) => void; onDelete: (id: number) => void; isSaving: boolean }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: card.id })
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
                <h3 className="font-semibold text-base truncate">{card.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{card.content} • Order: {card.order}</p>
            </div>

            <div className="flex gap-2 items-center">
                <Button size="sm" variant="outline" onClick={() => onEdit(card)}>
                    <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDelete(card.id)} disabled={isSaving}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

export default function SwipeCardsPage() {
    const params = useParams()
    const lessonId = parseInt(params.lessonId as string)

    const [cards, setCards] = useState<SwipeCard[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingCard, setEditingCard] = useState<SwipeCard | null>(null)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [image, setImage] = useState('')

    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

    const loadCards = async () => {
        const res = await fetch(`/api/swipe-cards?lessonId=${lessonId}`)
        const data = await res.json()
        setCards(Array.isArray(data) ? data.sort((a, b) => a.order - b.order) : [])
    }

    useEffect(() => { void loadCards() }, [lessonId])

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        if (over && active.id !== over.id) {
            const oldIndex = cards.findIndex((c) => c.id === active.id)
            const newIndex = cards.findIndex((c) => c.id === over.id)
            const newCards = arrayMove(cards, oldIndex, newIndex)
            const updatedCards = newCards.map((c, i) => ({ ...c, order: i + 1 }))
            setCards(updatedCards)

            const items = updatedCards.map(c => ({ id: c.id, order: c.order }))
            const res = await fetch('/api/swipe-cards', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'reorder', items })
            })
            if (!res.ok) { toast('Failed to save order'); await loadCards() }
        }
    }

    const handleOpenDialog = (card?: SwipeCard) => {
        if (card) {
            setEditingCard(card)
            setTitle(card.title)
            setContent(card.content)
            setImage(card.image || '')
        } else {
            setEditingCard(null)
            setTitle('')
            setContent('')
            setImage('')
        }
        setIsDialogOpen(true)
    }

    const handleSubmit = async () => {
        if (!title || !content) { toast('Please fill required fields'); return }
        setIsSaving(true)

        if (editingCard) {
            const res = await fetch('/api/swipe-cards', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: editingCard.id, title, content, image: image || null })
            })
            setIsSaving(false)
            if (res.ok) { toast('Updated'); setIsDialogOpen(false); await loadCards() }
            else { toast('Failed') }
        } else {
            const res = await fetch('/api/swipe-cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessonId, title, content, image: image || null, order: cards.length + 1 })
            })
            setIsSaving(false)
            if (res.ok) { toast('Created'); setIsDialogOpen(false); await loadCards() }
            else { toast('Failed') }
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this card?')) return
        setIsSaving(true)
        const res = await fetch(`/api/swipe-cards?id=${id}`, { method: 'DELETE' })
        setIsSaving(false)
        if (res.ok) { toast('Deleted'); await loadCards() }
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
                        <CreditCard className="h-8 w-8" /> Swipe Cards
                    </h1>
                    <p className="text-muted-foreground">Manage swipe card challenges</p>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Swipe Cards</CardTitle>
                    <Button onClick={() => handleOpenDialog()}>
                        <Plus className="mr-2 h-4 w-4" /> Add Card
                    </Button>
                </CardHeader>
                <CardContent>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-3">
                                {cards.map(card => <SortableCard key={card.id} card={card} onEdit={handleOpenDialog} onDelete={handleDelete} isSaving={isSaving} />)}
                            </div>
                        </SortableContext>
                    </DndContext>
                    {cards.length === 0 && <div className="text-center py-12 text-muted-foreground">No cards yet</div>}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCard ? 'Edit Card' : 'Add Card'}</DialogTitle>
                        <DialogDescription>{editingCard ? 'Update card details' : 'Add a new swipe card'}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input placeholder="Card title" value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Content</Label>
                            <Textarea rows={4} placeholder="Card content" value={content} onChange={(e) => setContent(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Image URL (optional)</Label>
                            <Input placeholder="https://..." value={image} onChange={(e) => setImage(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={isSaving}>{isSaving ? 'Saving...' : editingCard ? 'Update' : 'Create'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
