'use client';

import React from 'react';
import { Editor } from '@tiptap/react';
import { Bold, Italic, Underline, Link } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface RichTextToolbarProps {
  editor: Editor;
  onLinkClick: () => void;
}

/**
 * Rich Text Toolbar Component
 *
 * Formatting toolbar with B/I/U/Link buttons.
 * Active states shown with the emerald brand accent.
 */
export const RichTextToolbar: React.FC<RichTextToolbarProps> = ({ editor, onLinkClick }) => {
  const tools = [
    {
      icon: Bold,
      label: 'Bold',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
      shortcut: 'Ctrl+B',
    },
    {
      icon: Italic,
      label: 'Italic',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      shortcut: 'Ctrl+I',
    },
    {
      icon: Underline,
      label: 'Underline',
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive('underline'),
      shortcut: 'Ctrl+U',
    },
    {
      icon: Link,
      label: 'Link',
      action: onLinkClick,
      isActive: editor.isActive('link'),
      shortcut: 'Ctrl+K',
    },
  ];

  return (
    <div className="flex items-center gap-1 rounded-t-lg border border-b-0 border-border bg-paper-tint/40 p-1">
      {tools.map((tool) => (
        <Button
          key={tool.label}
          type="button"
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            tool.action();
          }}
          aria-label={tool.label}
          aria-pressed={tool.isActive}
          title={`${tool.label} (${tool.shortcut})`}
          className={cn(
            'h-7 w-7 rounded-md',
            tool.isActive &&
              'bg-primary text-white hover:bg-[color:var(--color-primary-hover)] hover:text-white'
          )}
        >
          <tool.icon className="w-4 h-4" />
        </Button>
      ))}
    </div>
  );
};
