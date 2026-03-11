'use client';

import { useEditor, EditorContent, Mark } from '@tiptap/react';
import { mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Eraser,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Кастомное расширение для цвета текста — не зависит от TextStyle
const ColorMark = Mark.create({
  name: 'colorMark',
  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) => element.style.color || null,
        renderHTML: (attributes) => {
          if (!attributes.color) return {};
          return { style: `color: ${attributes.color}` };
        },
      },
    };
  },
  parseHTML() {
    return [{ tag: 'span[style*="color"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0];
  },
  addCommands(): any {
    return {
      setTextColor:
        (color: string) =>
        ({ commands }: any) =>
          commands.setMark('colorMark', { color }),
      unsetTextColor:
        () =>
        ({ commands }: any) =>
          commands.unsetMark('colorMark'),
    };
  },
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const COLORS = [
  { label: 'Чорний',    value: '#111827' },
  { label: 'Сірий',     value: '#6b7280' },
  { label: 'Червоний',  value: '#dc2626' },
  { label: 'Оранжевий', value: '#ea580c' },
  { label: 'Жовтий',   value: '#ca8a04' },
  { label: 'Зелений',  value: '#16a34a' },
  { label: 'Синій',    value: '#2563eb' },
  { label: 'Фіолетовий',value: '#9333ea' },
  { label: 'Рожевий',  value: '#db2777' },
];

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={cn(
        'p-1.5 rounded transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-muted text-foreground'
      )}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      ColorMark,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        defaultAlignment: 'left',
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === '<p></p>' ? '' : html);
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor min-h-[80px] px-3 py-2 text-sm outline-none',
      },
    },
  });

  // Синхронизируем внешнее значение при смене языка
  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    const normalized = currentHtml === '<p></p>' ? '' : currentHtml;
    if (normalized !== (value || '')) {
      editor.commands.setContent(value || '', false);
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!editor) return null;

  const activeColor = COLORS.find((c) =>
    editor.isActive('colorMark', { color: c.value })
  )?.value ?? null;

  return (
    <div className={cn('border rounded-md overflow-hidden bg-background', className)}>
      {/* Тулбар */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b bg-muted/30">

        {/* Форматирование */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Жирний (Ctrl+B)">
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Курсив (Ctrl+I)">
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Підкреслення (Ctrl+U)">
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-0.5" />

        {/* Списки */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Маркований список">
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Нумерований список">
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-0.5" />

        {/* Выравнивание */}
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="По лівому краю">
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="По центру">
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="По правому краю">
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="По ширині">
          <AlignJustify className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-0.5" />

        {/* Цвета */}
        <div className="flex items-center gap-1">
          {COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              title={color.label}
              onMouseDown={(e) => {
                e.preventDefault();
                if (activeColor === color.value) {
                  (editor.chain().focus() as any).unsetTextColor().run();
                } else {
                  (editor.chain().focus() as any).setTextColor(color.value).run();
                }
              }}
              className={cn(
                'w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer',
                activeColor === color.value
                  ? 'border-foreground scale-110 ring-2 ring-offset-1 ring-foreground/40'
                  : 'border-white dark:border-gray-700'
              )}
              style={{ backgroundColor: color.value }}
            />
          ))}
        </div>

        <div className="w-px h-5 bg-border mx-0.5" />

        {/* Сброс форматирования */}
        <ToolbarButton onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} title="Очистити форматування">
          <Eraser className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Область редактирования */}
      <div className="relative">
        <EditorContent editor={editor} />
        {!value && (
          <p className="absolute top-2 left-3 text-xs text-muted-foreground pointer-events-none select-none">
            {placeholder}
          </p>
        )}
      </div>
    </div>
  );
}
