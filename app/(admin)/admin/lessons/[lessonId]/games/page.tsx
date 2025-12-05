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
import { Edit, Trash2, Plus, ArrowLeft, Gamepad2 } from 'lucide-react'
import Link from 'next/link'

type Game = { id: number; lessonId: number; title: string; component: string; thumbnail: string | null }

export default function GamesPage() {
    const params = useParams()
    const lessonId = parseInt(params.lessonId as string)

    const [games, setGames] = useState<Game[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingGame, setEditingGame] = useState<Game | null>(null)
    const [title, setTitle] = useState('')
    const [component, setComponent] = useState('')
    const [thumbnail, setThumbnail] = useState('')

    const loadGames = async () => {
        const res = await fetch(`/api/games?lessonId=${lessonId}`)
        const gamesData = await res.json()
        setGames(Array.isArray(gamesData) ? gamesData : [])
    }

    useEffect(() => { void loadGames() }, [lessonId])

    const handleOpenDialog = (game?: Game) => {
        if (game) {
            setEditingGame(game)
            setTitle(game.title)
            setComponent(game.component)
            setThumbnail(game.thumbnail || '')
        } else {
            setEditingGame(null)
            setTitle('')
            setComponent('')
            setThumbnail('')
        }
        setIsDialogOpen(true)
    }

    const handleSubmit = async () => {
        if (!title || !component) { toast('Please fill required fields'); return }
        setIsSaving(true)

        const payload = { title, component, thumbnail }

        if (editingGame) {
            const res = await fetch('/api/games', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: editingGame.id, ...payload })
            })
            setIsSaving(false)
            if (res.ok) { toast('Updated'); setIsDialogOpen(false); await loadGames() }
            else { toast('Failed') }
        } else {
            const res = await fetch('/api/games', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessonId, ...payload })
            })
            setIsSaving(false)
            if (res.ok) { toast('Created'); setIsDialogOpen(false); await loadGames() }
            else { toast('Failed') }
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this game?')) return
        setIsSaving(true)
        const res = await fetch(`/api/games?id=${id}`, { method: 'DELETE' })
        setIsSaving(false)
        if (res.ok) { toast('Deleted'); await loadGames() }
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
                        <Gamepad2 className="h-8 w-8" /> Games
                    </h1>
                    <p className="text-muted-foreground">Manage game challenges</p>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Games</CardTitle>
                    <Button onClick={() => handleOpenDialog()}>
                        <Plus className="mr-2 h-4 w-4" /> Add Game
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {games.map(game => (
                            <div key={game.id} className="bg-card border rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    {game.thumbnail && (
                                        <img src={game.thumbnail} alt={game.title} className="w-16 h-16 object-cover rounded-md" />
                                    )}
                                    <div>
                                        <h3 className="font-semibold">{game.title}</h3>
                                        <p className="text-sm text-muted-foreground">Component: {game.component}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => handleOpenDialog(game)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => handleDelete(game.id)} disabled={isSaving}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {games.length === 0 && <div className="text-center py-12 text-muted-foreground">No games yet</div>}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingGame ? 'Edit Game' : 'Add Game'}</DialogTitle>
                        <DialogDescription>{editingGame ? 'Update game details' : 'Add a new game'}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input placeholder="Game title" value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Component</Label>
                            <Input placeholder="e.g. alphabet" value={component} onChange={(e) => setComponent(e.target.value)} />
                            <p className="text-xs text-muted-foreground">The filename of the component in components/games (without extension)</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Thumbnail URL</Label>
                            <Input placeholder="https://..." value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={isSaving}>{isSaving ? 'Saving...' : editingGame ? 'Update' : 'Create'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
