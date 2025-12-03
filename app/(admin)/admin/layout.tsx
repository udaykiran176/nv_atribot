"use client"

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Key, BookOpen, Users, LogOut, Menu, X, Book, Video, CreditCard, Gamepad2, List, HelpCircle, Flag } from 'lucide-react'
import { useEffect, useState } from 'react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: Users },
  { href: '/admin/license', label: 'License Keys', icon: Key },
  { href: '/admin/course', label: 'Courses', icon: Book },
  { href: '/admin/lessons', label: 'Lessons', icon: BookOpen },
  { href: '/admin/challenges', label: 'All Challenges', icon: Flag },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let mounted = true
    const check = async () => {
      try {
        const res = await fetch('/api/is-admin', { cache: 'no-store' })
        const data = await res.json()
        if (mounted) setIsAdmin(Boolean(data?.isAdmin))
        if (mounted) setLoading(false)
        if (mounted && !data?.isAdmin) router.push('/')
      } catch {
        if (mounted) setLoading(false)
        router.push('/')
      }
    }
    void check()
    return () => { mounted = false }
  }, [router])

  const titleMap: Record<string, string> = {
    '/admin': 'Dashboard',
    '/admin/course': 'Courses',
  }
  const title = titleMap[pathname] || 'Admin'

  if (loading || !isAdmin) return null

  return (
    <div className="min-h-screen bg-background flex">
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300
        lg:relative lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2">
            <div>
              <span className="font-display text-lg font-bold text-primary">Atribot</span>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${pathname === item.href
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }
              `}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => router.push('/')}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Exit Admin
          </Button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-background/80 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-4">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h1 className="font-display text-xl font-bold">{title}</h1>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

