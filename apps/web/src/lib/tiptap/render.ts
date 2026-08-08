import "server-only";
import { generateHTML } from "@tiptap/html";
import { getTiptapExtensions } from "./extensions";

const WORDS_PER_MINUTE = 220;

/**
 * Regenerates the cached `content_html` column from `content_json` on
 * every save. The public article page renders this column directly and
 * never runs the rich-text renderer itself — see ARCHITECTURE.md's CMS
 * Architecture section.
 */
export function renderArticleHtml(contentJson: Record<string, unknown>): string {
  return generateHTML(contentJson, getTiptapExtensions());
}

export function estimateReadingTimeMinutes(
  contentJson: Record<string, unknown>,
): number {
  const text = extractPlainText(contentJson);
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
}

function extractPlainText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const obj = node as { text?: string; content?: unknown[] };
  let text = obj.text ?? "";
  if (Array.isArray(obj.content)) {
    text += " " + obj.content.map(extractPlainText).join(" ");
  }
  return text;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 96);
}
