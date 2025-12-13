
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { WikiQRCode } from '@/components/wiki/qr-code';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2, ExternalLink, QrCode } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface WikiPost {
    id: number;
    title: string;
    category: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
}

export default function AdminWikiPage() {
    const [posts, setPosts] = useState<WikiPost[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [qrPost, setQrPost] = useState<WikiPost | null>(null);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('q', search);

            const res = await fetch(`/api/wiki?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            }
        } catch (error) {
            toast.error('Failed to load wiki posts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [search]); // Simple debounce could be added, but relying on simple effect for now

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            const res = await fetch(`/api/wiki/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Post deleted');
                setPosts(posts.filter(p => p.id !== id));
            } else {
                toast.error('Failed to delete post');
            }
        } catch (error) {
            toast.error('Error deleting post');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Wiki Posts</h1>
                    <p className="text-muted-foreground">Manage your electronic component documentation.</p>
                </div>
                <Link href="/admin/wiki/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Post
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search posts..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="py-8 text-center text-muted-foreground">Loading...</div>
                    ) : posts.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">No posts found.</div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Last Updated</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {posts.map((post) => (
                                        <TableRow key={post.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span>{post.title}</span>
                                                    <span className="text-xs text-muted-foreground">/{post.slug}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{post.category}</Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {format(new Date(post.updatedAt), 'MMM d, yyyy')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" title="View QR Code" onClick={() => setQrPost(post)}>
                                                        <QrCode className="w-4 h-4" />
                                                    </Button>
                                                    <Link href={`/wiki/${post.slug}`} target="_blank">
                                                        <Button variant="ghost" size="icon" title="View Public Page">
                                                            <ExternalLink className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/admin/wiki/${post.id}`}>
                                                        <Button variant="ghost" size="icon" title="Edit">
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)} className="text-destructive hover:text-destructive">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!qrPost} onOpenChange={() => setQrPost(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Mobile View QR</DialogTitle>
                    </DialogHeader>
                    {qrPost && (
                        <div className="flex flex-col items-center gap-4 py-4">
                            <WikiQRCode
                                url={`${process.env.NEXT_PUBLIC_PUBLIC_WEB_LINK || (typeof window !== 'undefined' ? window.location.origin : '')}/wiki/${qrPost.slug}`}
                                size={200}
                            />
                            <div className="text-center">
                                <p className="font-semibold">{qrPost.title}</p>
                                <p className="text-sm text-muted-foreground">Scan to view on mobile</p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
