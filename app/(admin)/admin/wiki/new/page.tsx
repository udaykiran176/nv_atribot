
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/wiki/rich-text-editor';
import { CategoryCombobox } from '@/components/wiki/category-combobox';
import { toast } from 'sonner';
import { ArrowLeft, Save, Globe, LayoutTemplate } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function NewWikiPost() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        category: '',
        content: '',
        coverImage: '',
        excerpt: '',
    });

    const generateSlug = (title: string) => {
        return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setFormData(prev => ({ ...prev, title, slug: generateSlug(title) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/wiki', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                throw new Error('Failed to create post');
            }

            const newPost = await res.json();
            toast.success('Wiki post created successfully');

            // Redirect to the edit page of the newly created post
            if (newPost.id) {
                router.push(`/admin/wiki/${newPost.id}`);
            } else {
                router.push('/admin/wiki');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

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
                    <span className="text-sm font-medium text-muted-foreground">New Wiki Post</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleSubmit} disabled={loading} size="sm">
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Creating...' : 'Publish'}
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
                                    onChange={handleTitleChange}
                                    placeholder="Add title"
                                    className="text-4xl font-bold border-none px-0 shadow-none focus-visible:ring-0 h-auto placeholder:text-muted-foreground/50"
                                    required
                                />
                                <div className="flex items-center gap-2 text-sm text-muted-foreground/70">
                                    <Globe className="w-3 h-3" />
                                    <span>Permalink:</span>
                                    <span className="text-primary/80">/wiki/</span>
                                    <Input
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="h-6 w-auto min-w-[100px] px-1 py-0 text-sm border-none focus-visible:ring-0 text-primary/80 hover:bg-muted/50 rounded"
                                        required
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
