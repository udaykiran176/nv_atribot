
'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/wiki/rich-text-editor';
import { WikiQRCode } from '@/components/wiki/qr-code';
import { CategoryCombobox } from '@/components/wiki/category-combobox';
import { toast } from 'sonner';
import { ArrowLeft, Save, ExternalLink, Globe, LayoutTemplate } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function EditWikiPost(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        category: '',
        content: '',
        coverImage: '',
        excerpt: '',
    });

    const postId = params.id;

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await fetch(`/api/wiki/${postId}`);
                if (!res.ok) throw new Error('Failed to load');
                const data = await res.json();
                setFormData({
                    title: data.title,
                    slug: data.slug,
                    category: data.category,
                    content: data.content,
                    coverImage: data.coverImage || '',
                    excerpt: data.excerpt || '',
                });
            } catch (error) {
                toast.error('Failed to load post');
                router.push('/admin/wiki');
            } finally {
                setFetching(false);
            }
        };
        if (postId) fetchPost();
    }, [postId, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`/api/wiki/${postId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                throw new Error('Failed to update post');
            }

            toast.success('Wiki post updated successfully');
            // No redirect - stay on page
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="h-screen flex items-center justify-center text-muted-foreground">Loading editor...</div>;

    const publicUrl = `${process.env.NEXT_PUBLIC_PUBLIC_WEB_LINK || (typeof window !== 'undefined' ? window.location.origin : '')}/wiki/${formData.slug}`;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Top Toolbar */}
            <div className="h-14 border-b border-border bg-card flex items-center justify-between px-4 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/admin/wiki">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Exit to Wiki
                        </Button>
                    </Link>
                    <Separator orientation="vertical" className="h-6" />
                    <span className="text-sm font-medium text-muted-foreground">Editing: {formData.title || 'Untitled'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Preview
                        </a>
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading} size="sm">
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Saving...' : 'Update'}
                    </Button>
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 overflow-hidden">
                <div className="h-full flex flex-col lg:flex-row">
                    {/* Left Column: Content */}
                    <div className="flex-1 overflow-y-auto p-8 lg:p-12 scrollbar-hide">
                        <div className="max-w-3xl mx-auto space-y-8">
                            <div className="space-y-4">
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Add title"
                                    className="text-4xl font-bold border-none px-0 shadow-none focus-visible:ring-0 h-auto placeholder:text-muted-foreground/50"
                                />
                                <div className="flex items-center gap-2 text-sm text-muted-foreground/70">
                                    <Globe className="w-3 h-3" />
                                    <span>Permalink:</span>
                                    <span className="text-primary/80">/wiki/</span>
                                    <Input
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="h-6 w-auto min-w-[100px] px-1 py-0 text-sm border-none focus-visible:ring-0 text-primary/80 hover:bg-muted/50 rounded"
                                    />
                                </div>
                            </div>

                            <RichTextEditor
                                value={formData.content}
                                onChange={(content) => setFormData({ ...formData, content })}
                                className="min-h-[500px] border-none shadow-none focus-within:ring-0"
                            />
                        </div>
                    </div>

                    {/* Right Column: Sidebar Settings */}
                    <div className="w-full lg:w-80 border-l border-border bg-card/50 overflow-y-auto p-4 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium flex items-center gap-2">
                                    <LayoutTemplate className="w-4 h-4" />
                                    Page Settings
                                </h3>
                                <Card>
                                    <CardContent className="p-4 space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="category" className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Category</Label>
                                            <CategoryCombobox
                                                value={formData.category}
                                                onChange={(value) => setFormData({ ...formData, category: value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="coverImage" className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Cover Image URL</Label>
                                            <Input
                                                id="coverImage"
                                                value={formData.coverImage}
                                                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Excerpt</Label>
                                <Card>
                                    <CardContent className="p-4">
                                        <Textarea
                                            value={formData.excerpt}
                                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                            placeholder="Write a short summary..."
                                            className="resize-none min-h-[100px]"
                                        />
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">QR Code</Label>
                                <Card>
                                    <CardContent className="p-4 flex flex-col items-center">
                                        <WikiQRCode url={publicUrl} />
                                        <p className="text-xs text-muted-foreground mt-2 text-center break-all">{publicUrl}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
