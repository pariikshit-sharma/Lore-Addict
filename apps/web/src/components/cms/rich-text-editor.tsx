"use client";

import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import { useEffect, useRef } from "react";
import { getTiptapExtensions } from "@/lib/tiptap/extensions";
import { cn } from "@lore-addict/ui";

export interface RichTextEditorProps {
  initialContent: JSONContent;
  onChange: (content: JSONContent) => void;
  onAutosave: (content: JSONContent) => void;
  className?: string;
}

const AUTOSAVE_DEBOUNCE_MS = 4000;

/**
 * `onChange` fires on every keystroke (keeps the hidden form field that
 * saveArticleAction reads from up to date). `onAutosave` fires debounced,
 * per the CMS Architecture section — it writes to article_revisions, not
 * the live article, so a crashed tab never corrupts the published version.
 */
export function RichTextEditor({
  initialContent,
  onChange,
  onAutosave,
  className,
}: RichTextEditorProps) {
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: getTiptapExtensions(),
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[400px] focus:outline-none font-body text-paper",
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChange(json);

      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      autosaveTimer.current = setTimeout(() => {
        onAutosave(json);
      }, AUTOSAVE_DEBOUNCE_MS);
    },
  });

  useEffect(() => {
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, []);

  if (!editor) return null;

  return (
    <div className={cn("rounded-bubble border border-plum-deep bg-ink", className)}>
      <Toolbar editor={editor} />
      <div className="px-4 py-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function Toolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;

  const items: Array<{
    label: string;
    isActive: boolean;
    onClick: () => void;
  }> = [
    {
      label: "H2",
      isActive: editor.isActive("heading", { level: 2 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "H3",
      isActive: editor.isActive("heading", { level: 3 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: "B",
      isActive: editor.isActive("bold"),
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "I",
      isActive: editor.isActive("italic"),
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: "Quote",
      isActive: editor.isActive("blockquote"),
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      label: "List",
      isActive: editor.isActive("bulletList"),
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "1. List",
      isActive: editor.isActive("orderedList"),
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "Link",
      isActive: editor.isActive("link"),
      onClick: () => {
        const url = window.prompt("URL");
        if (url) editor.chain().focus().setLink({ href: url }).run();
      },
    },
  ];

  return (
    <div className="flex flex-wrap gap-1 border-b border-plum-deep px-3 py-2">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          className={cn(
            "rounded-md px-2 py-1 text-xs font-medium text-mute hover:bg-ink-raised hover:text-paper",
            item.isActive && "bg-ink-raised text-plum-bright",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
