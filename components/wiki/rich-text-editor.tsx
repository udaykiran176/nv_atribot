
"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapImage from '@tiptap/extension-image';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Quote, Code, Undo, Redo, ImageIcon, Palette, Highlighter } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ... interface ...

const Toolbar = ({ editor }: { editor: any }) => {
    if (!editor) return null;

    const addImage = () => {
        const url = window.prompt('URL');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    return (
        <div className="border border-input border-b-0 rounded-t-lg bg-transparent p-2 flex flex-wrap gap-1">
            {/* ... other buttons ... */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn(editor.isActive('bold') && "bg-muted")}
                type="button"
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn(editor.isActive('italic') && "bg-muted")}
                type="button"
            >
                <Italic className="h-4 w-4" />
            </Button>

            {/* Text Color Picker */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className={cn(editor.getAttributes('textStyle').color && "bg-muted")}>
                        <Palette className="h-4 w-4" style={{ color: editor.getAttributes('textStyle').color }} />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                    <div className="flex gap-1 flex-wrap max-w-[150px]">
                        {['#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'].map((color) => (
                            <button
                                key={color}
                                onClick={() => editor.chain().focus().setColor(color).run()}
                                className="w-6 h-6 rounded-full border border-border"
                                style={{ backgroundColor: color }}
                                type="button"
                            />
                        ))}
                        <button
                            onClick={() => editor.chain().focus().unsetColor().run()}
                            className="w-full text-xs mt-1 hover:underline"
                            type="button"
                        >
                            Reset
                        </button>
                    </div>
                </PopoverContent>
            </Popover>

            {/* Highlight Color Picker */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className={cn(editor.isActive('highlight') && "bg-muted")}>
                        <Highlighter className="h-4 w-4" style={{ color: editor.getAttributes('highlight').color }} />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                    <div className="flex gap-1 flex-wrap max-w-[150px]">
                        {['#fef08a', '#bbf7d0', '#bfdbfe', '#fecaca', '#ddd6fe', '#f3f4f6'].map((color) => (
                            <button
                                key={color}
                                onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
                                className="w-6 h-6 rounded-sm border border-border"
                                style={{ backgroundColor: color }}
                                type="button"
                                title={color}
                            />
                        ))}
                        <button
                            onClick={() => editor.chain().focus().unsetHighlight().run()}
                            className="w-full text-xs mt-1 hover:underline"
                            type="button"
                        >
                            Reset
                        </button>
                    </div>
                </PopoverContent>
            </Popover>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={cn(editor.isActive('heading', { level: 1 }) && "bg-muted")}
                type="button"
            >
                <Heading1 className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={cn(editor.isActive('heading', { level: 2 }) && "bg-muted")}
                type="button"
            >
                <Heading2 className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn(editor.isActive('bulletList') && "bg-muted")}
                type="button"
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn(editor.isActive('orderedList') && "bg-muted")}
                type="button"
            >
                <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={cn(editor.isActive('blockquote') && "bg-muted")}
                type="button"
            >
                <Quote className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={cn(editor.isActive('codeBlock') && "bg-muted")}
                type="button"
            >
                <Code className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={addImage}
                type="button"
            >
                <ImageIcon className="h-4 w-4" />
            </Button>
            <div className="ml-auto flex gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().undo().run()}
                    type="button"
                >
                    <Undo className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().redo().run()}
                    type="button"
                >
                    <Redo className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export const RichTextEditor = ({ value, onChange, className }: RichTextEditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            TiptapImage,
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
        ],
        content: value,
        editorProps: {
            attributes: {
                class: "prose dark:prose-invert max-w-none focus:outline-none min-h-[200px] px-3 py-2",
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        immediatelyRender: false,
    });

    return (
        <div className={cn("border border-input rounded-lg flex flex-col w-full", className)}>
            <Toolbar editor={editor} />
            <div className="border-t border-input bg-background rounded-b-lg">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
};
