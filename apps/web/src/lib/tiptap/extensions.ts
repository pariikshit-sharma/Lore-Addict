import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

/**
 * Used by both the client editor (rich-text-editor.tsx) and the
 * server-side renderer (render.ts) that produces `content_html` on save.
 * If these ever diverge, content that looks fine in the editor could
 * render differently on the public article page — so this list is
 * imported by both, never duplicated.
 */
export function getTiptapExtensions() {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3] }, // h1 is reserved for the article title itself
    }),
    Link.configure({
      openOnClick: false,
      autolink: true,
    }),
    Placeholder.configure({
      placeholder: "Start writing…",
    }),
  ];
}
