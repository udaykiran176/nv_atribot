'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, Clock, Calendar, ChevronRight, Hash } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface WikiPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    category: string;
    coverImage: string | null;
    updatedAt: string;
}

// Helper function to truncate text to specified word count
function truncateToWords(text: string, wordLimit: number = 10): string {
    if (!text) return '';
    const words = text.trim().split(/\s+/);
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
}

function WikiList() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [posts, setPosts] = useState<WikiPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<string[]>(['All']);
    const [search, setSearch] = useState(searchParams.get('q') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');

    // Fetch Unique Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/wiki/categories');
                if (res.ok) {
                    const data = await res.json();
                    setCategories(['All', ...data]);
                }
            } catch (error) {
                console.error('Failed to fetch categories');
            }
        };
        fetchCategories();
    }, []);

    // Fetch Posts
    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (search) params.append('q', search);
                if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);

                const res = await fetch(`/api/wiki?${params.toString()}`);
                if (res.ok) {
                    const data = await res.json();
                    setPosts(data);
                }
            } catch (error) {
                console.error('Failed to fetch posts');
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchPosts, 300); // Debounce
        return () => clearTimeout(timer);
    }, [search, selectedCategory]);

    // Update URL without reload
    useEffect(() => {
        const params = new URLSearchParams();
        if (search) params.append('q', search);
        if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);
        router.push(`/wiki?${params.toString()}`, { scroll: false });
    }, [search, selectedCategory, router]);

    return (
        <>
            <div className="mx-auto flex w-full max-w-[988px] flex-1 flex-col gap-2 lg:flex-row lg:pt-4 p-4">
                <div className="mx-auto flex w-full max-w-[988px] flex-1 flex-col gap-2">
                    <div className='flex items-center justify-between gap-2 flex-col lg:flex-row'>
                        <div className="text-center lg:text-left">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Wiki</h1>
                            <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-0.5 sm:mt-1">
                                Documentation and tutorials.
                            </p>
                        </div>
                        <div className="relative w-full md:w-64 lg:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search articles..."
                                className="pl-8 sm:pl-9 bg-background text-sm h-9 sm:h-10"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>


                    {/* Category Filter - Scrollable */}
                    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 sm:py-4 mb-4 sm:mb-6 -mx-3 px-3 sm:-mx-4 sm:px-4 md:mx-0 md:px-0 border-b md:border-none">
                        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none mask-fade-right">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={cn(
                                        "flex items-center whitespace-nowrap px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 border flex-shrink-0",
                                        selectedCategory === cat
                                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                            : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:bg-accent"
                                    )}
                                >
                                    {cat === 'All' ? <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" /> : <Hash className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 opacity-70" />}
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="flex flex-col space-y-2 sm:space-y-3">
                                    <div className="h-40 sm:h-44 md:h-48 rounded-lg sm:rounded-xl bg-muted/50 animate-pulse" />
                                    <div className="space-y-2">
                                        <div className="h-3 sm:h-4 w-3/4 rounded bg-muted/50 animate-pulse" />
                                        <div className="h-3 sm:h-4 w-1/2 rounded bg-muted/50 animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-12 sm:py-16 md:py-20 bg-muted/20 rounded-xl sm:rounded-2xl border border-dashed border-muted-foreground/20 px-4">
                            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-muted mb-3 sm:mb-4">
                                <Search className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">No articles found</h3>
                            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                                We couldn&apos;t find any matches for &quot;{search}&quot; in {selectedCategory}.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="sm:h-10"
                                onClick={() => { setSearch(''); setSelectedCategory('All'); }}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                            <AnimatePresence mode='popLayout'>
                                {posts.map((post) => (
                                    <motion.div
                                        key={post.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Link href={`/wiki/${post.slug}`} className="group h-full block">
                                            <Card className="h-full flex flex-col overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg dark:hover:shadow-primary/5 bg-card/50 backdrop-blur-sm p-0 gap-2">
                                                {/* Image */}
                                                <div className="aspect-video w-full overflow-hidden relative bg-muted p-0">
                                                    {post.coverImage ? (
                                                        <Image
                                                            src={post.coverImage}
                                                            alt={post.title}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                                                            <BookOpen className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 text-muted-foreground/30" />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                    <Badge className="absolute top-2 left-2 sm:top-3 sm:left-3 text-xs bg-background/80 backdrop-blur text-foreground border-transparent shadow-sm pointer-events-none">
                                                        {post.category}
                                                    </Badge>
                                                </div>

                                                <CardHeader className="flex-1 space-y-2 sm:space-y-2.5 md:space-y-3 px-4 py-4 sm:p-2">
                                                    <CardTitle className='p-0 m-0'>
                                                        {post.title}
                                                    </CardTitle>
                                                    <CardDescription className='p-0 m-0'>
                                                        {truncateToWords(post.excerpt) || 'Read this article to learn more...'}

                                                    </CardDescription>

                                                    <p className='flex items-center gap-2'>Read Article <span ><ChevronRight className="h-4 w-4" /></span></p>

                                                </CardHeader>


                                            </Card>
                                        </Link>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                </div>
            </div>
        </>
    );
}

export default function WikiPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading Wiki...</div>}>
            <WikiList />
        </Suspense>
    );
}
