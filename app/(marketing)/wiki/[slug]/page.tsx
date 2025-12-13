
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { wikiPosts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Badge } from '@/components/ui/badge';
import { Metadata } from 'next';
import { Tag, ChevronRight, Home, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
    const params = await props.params;
    const post = await db.query.wikiPosts.findFirst({
        where: eq(wikiPosts.slug, params.slug)
    });

    if (!post) return { title: 'Not Found' };

    return {
        title: `${post.title} - Atribot Wiki`,
        description: post.excerpt || `Read about ${post.title} on Atribot Wiki`,
        openGraph: {
            title: post.title,
            description: post.excerpt || '',
            images: post.coverImage ? [post.coverImage] : [],
        }
    };
}

export default async function WikiDetailPage(props: Props) {
    const params = await props.params;
    const post = await db.query.wikiPosts.findFirst({
        where: eq(wikiPosts.slug, params.slug)
    });

    if (!post) {
        notFound();
    }

    // JSON-LD Structured Data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt,
        image: post.coverImage,
        datePublished: post.createdAt?.toISOString(),
        dateModified: post.updatedAt?.toISOString(),
        author: {
            '@type': 'Organization',
            name: 'Atribot',
        },
    };

    return (
        <article className="mx-auto flex w-full max-w-[988px] flex-1 flex-col gap-2">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Breadcrumb / Navigation */}
            <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container max-w-4xl flex items-center h-12 sm:h-14 px-3 sm:px-4 md:px-6">
                    <Link href="/wiki" className="text-muted-foreground hover:text-foreground transition-colors mr-1.5 sm:mr-2 flex-shrink-0">
                        <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="sr-only">Back to Wiki</span>
                    </Link>
                    <Separator orientation="vertical" className="h-3 sm:h-4 mx-1.5 sm:mx-2" />
                    <nav className="flex items-center text-xs sm:text-sm text-muted-foreground overflow-hidden whitespace-nowrap mask-fade-right min-w-0">
                        <Link href="/" className="hover:text-foreground transition-colors flex items-center flex-shrink-0">
                            <Home className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5 sm:mr-1" />
                            <span className="hidden sm:inline">Home</span>
                        </Link>
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mx-0.5 sm:mx-1 flex-shrink-0" />
                        <Link href="/wiki" className="hover:text-foreground transition-colors flex-shrink-0">
                            Wiki
                        </Link>
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mx-0.5 sm:mx-1 flex-shrink-0" />
                        <span className="text-foreground font-medium truncate min-w-0">
                            {post.title}
                        </span>
                    </nav>
                </div>
            </div>

            <div className="container max-w-4xl mx-auto px-3 sm:px-4 md:px-6 mt-4 sm:mt-6 md:mt-8 lg:mt-10">
                {/* Header Section */}
                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3">
                        <Link href={`/wiki?category=${post.category}`}>
                            <Badge variant="secondary" className="text-xs sm:text-sm px-2.5 sm:px-3 py-0.5 sm:py-1 hover:bg-secondary/80 transition-colors cursor-pointer">
                                <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-1.5" />
                                {post.category}
                            </Badge>
                        </Link>

                    </div>

                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight px-2 sm:px-0">
                        {post.title}
                    </h1>

                    {post.excerpt && (
                        <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto md:mx-0 px-2 sm:px-0">
                            {post.excerpt}
                        </p>
                    )}
                </div>

                {/* Hero Image */}
                {post.coverImage && (
                    <div className="relative aspect-video w-full rounded-lg sm:rounded-xl overflow-hidden mb-6 sm:mb-8 md:mb-10 border bg-muted shadow-sm">
                        <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover"
                            priority
                            sizes="(max-width: 640px) 100vw, (max-width: 1200px) 90vw, 1200px"
                        />
                    </div>
                )}

                {/* Main Content */}
                <div className="relative">
                    <div className="prose dark:prose-invert prose-sm sm:prose-base md:prose-lg max-w-none 
                        prose-headings:font-bold prose-headings:tracking-tight prose-headings:scroll-m-20
                        prose-p:leading-relaxed prose-p:text-muted-foreground/90
                        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                        prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:py-1.5 sm:prose-blockquote:py-2 prose-blockquote:px-4 sm:prose-blockquote:px-6 prose-blockquote:rounded-r-lg
                        prose-img:rounded-lg sm:prose-img:rounded-xl prose-img:shadow-md prose-img:border
                        prose-code:bg-muted prose-code:text-primary prose-code:px-1 sm:prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                        prose-pre:text-sm sm:prose-pre:text-base
                        prose-ul:my-4 sm:prose-ul:my-6 prose-ol:my-4 sm:prose-ol:my-6
                        prose-li:my-1 sm:prose-li:my-2
                        mb-12 sm:mb-16 md:mb-20">
                        <div dangerouslySetInnerHTML={{ __html: post.content }} />
                    </div>

                    {/* Footer / CTA (Optional) */}
                    <div className="border-t pt-6 sm:pt-8 md:pt-10 mt-6 sm:mt-8 md:mt-10">
                        <div className="flex justify-between items-center">
                            <Link href="/wiki">
                                <Button variant="ghost" size="sm" className="gap-1.5 sm:gap-2 pl-0 hover:pl-1 sm:hover:pl-2 transition-all text-xs sm:text-sm h-8 sm:h-10">
                                    <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">Back to All Articles</span>
                                    <span className="sm:hidden">Back to Wiki</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}
