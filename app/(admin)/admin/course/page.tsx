"use client"

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type Course = { id: number; title: string; description: string }

export default function CourseCreate() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [courses, setCourses] = useState<Course[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const loadCourses = async () => {
    const res = await fetch('/api/courses', { cache: 'no-store' })
    const data = await res.json()
    setCourses(Array.isArray(data) ? data : [])
  }

  useEffect(() => {
    const t = setTimeout(() => { void loadCourses() }, 0)
    return () => clearTimeout(t)
  }, [])

  const handleCreate = async () => {
    if (!title || !description) {
      toast('Please fill all fields.')
      return
    }
    setIsSaving(true)
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description })
    })
    setIsSaving(false)
    if (res.ok) {
      toast('New course has been added.')
      setTitle(''); setDescription('')
      await loadCourses()
    } else {
      const msg = await res.json().catch(() => ({}))
      toast(msg?.error || 'Failed to create course.')
    }
  }

  return (
    <div className="grid gap-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-display">Create Course</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Level 1 – Beginner Robotics" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea id="description" className="border-input w-full rounded-md border bg-transparent p-3 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]" rows={4} placeholder="Course details" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <Button variant="primary" onClick={handleCreate} disabled={isSaving}>Create Course</Button>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-display">Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Title</th>
                  <th className="text-left p-2">Description</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(c => (
                  <tr key={c.id} className="border-b">
                    <td className="p-2 font-mono">{c.id}</td>
                    <td className="p-2">{c.title}</td>
                    <td className="p-2 text-muted-foreground">{c.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
