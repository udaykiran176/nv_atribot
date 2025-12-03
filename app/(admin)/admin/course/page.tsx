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
import { Edit, Trash2, Plus } from 'lucide-react'

type Course = { id: number; title: string; description: string; order: number }

function SortableCourseCard({ course, onEdit, onDelete, isSaving }: {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (id: number) => void;
  isSaving: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: course.id })

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
        <h3 className="font-semibold text-base truncate">{course.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">Order: {course.order}</p>
      </div>

      <div className="flex gap-2 items-center">
        <Button size="sm" variant="outline" onClick={() => onEdit(course)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => onDelete(course.id)} disabled={isSaving}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default function CourseCreate() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [courses, setCourses] = useState<Course[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const loadCourses = async () => {
    const res = await fetch('/api/courses', { cache: 'no-store' })
    const data = await res.json()
    const sorted = Array.isArray(data) ? data.sort((a, b) => a.order - b.order) : []
    setCourses(sorted)
  }

  useEffect(() => {
    const t = setTimeout(() => { void loadCourses() }, 0)
    return () => clearTimeout(t)
  }, [])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = courses.findIndex((c) => c.id === active.id)
      const newIndex = courses.findIndex((c) => c.id === over.id)

      const newCourses = arrayMove(courses, oldIndex, newIndex)
      const updatedCourses = newCourses.map((course, index) => ({
        ...course,
        order: index + 1
      }))

      setCourses(updatedCourses)

      // Save new order to backend
      const items = updatedCourses.map(c => ({ id: c.id, order: c.order }))
      const res = await fetch('/api/courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'reorder', items })
      })

      if (!res.ok) {
        toast('Failed to save new order')
        await loadCourses() // Reload on error
      }
    }
  }

  const handleOpenDialog = (course?: Course) => {
    if (course) {
      setEditingCourse(course)
      setTitle(course.title)
      setDescription(course.description)
    } else {
      setEditingCourse(null)
      setTitle('')
      setDescription('')
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingCourse(null)
    setTitle('')
    setDescription('')
  }

  const handleSubmit = async () => {
    if (!title || !description) {
      toast('Please fill all fields.')
      return
    }

    setIsSaving(true)

    if (editingCourse) {
      // Update existing course
      const res = await fetch('/api/courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingCourse.id, title, description })
      })
      setIsSaving(false)
      if (res.ok) {
        toast('Course updated successfully.')
        handleCloseDialog()
        await loadCourses()
      } else {
        const msg = await res.json().catch(() => ({}))
        toast(msg?.error || 'Failed to update course.')
      }
    } else {
      // Create new course
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      })
      setIsSaving(false)
      if (res.ok) {
        toast('New course has been added.')
        handleCloseDialog()
        await loadCourses()
      } else {
        const msg = await res.json().catch(() => ({}))
        toast(msg?.error || 'Failed to create course.')
      }
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this course?')) return

    setIsSaving(true)
    const res = await fetch(`/api/courses?id=${id}`, { method: 'DELETE' })
    setIsSaving(false)
    if (res.ok) {
      toast('Course deleted successfully.')
      await loadCourses()
    } else {
      const msg = await res.json().catch(() => ({}))
      toast(msg?.error || 'Failed to delete course.')
    }
  }

  return (
    <div className="grid gap-6">
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-display">Courses</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Manage your courses and their order</p>
          </div>
          <Button variant="primary" onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Course
          </Button>
        </CardHeader>
        <CardContent>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={courses.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {courses.map(course => (
                  <SortableCourseCard
                    key={course.id}
                    course={course}
                    onEdit={handleOpenDialog}
                    onDelete={handleDelete}
                    isSaving={isSaving}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {courses.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No courses yet. Create your first course above.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCourse ? 'Edit Course' : 'Create Course'}</DialogTitle>
            <DialogDescription>
              {editingCourse ? 'Update the course details' : 'Add a new course to your platform'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dialog-title">Title</Label>
              <Input
                id="dialog-title"
                placeholder="Level 1 – Beginner Robotics"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dialog-description">Description</Label>
              <textarea
                id="dialog-description"
                className="border-input w-full rounded-md border bg-transparent p-3 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                rows={4}
                placeholder="Course details"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
