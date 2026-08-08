import { SpoilerBlock } from "@lore-addict/ui";

export function ArticleBody({
  id,
  html,
  containsSpoilers,
  spoilerScope,
}: {
  id: string;
  html: string;
  containsSpoilers: boolean;
  spoilerScope: string | null;
}) {
  const content = (
    <div
      className="prose prose-invert max-w-prose font-body text-paper prose-headings:font-display prose-a:text-plum-bright"
      // content_html is generated server-side from Tiptap's constrained
      // document schema (see lib/tiptap/render.ts) — never raw
      // user-submitted HTML — so this is not an XSS vector the way
      // rendering arbitrary HTML would be. See ARCHITECTURE.md Security.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );

  // The id-bearing wrapper is always present, even pre-reveal, so
  // ReadingProgressBar's getElementById lookup has something to measure
  // against from first paint regardless of spoiler state.
  return (
    <div id={id}>
      {containsSpoilers ? (
        <SpoilerBlock scope={spoilerScope ?? undefined}>{content}</SpoilerBlock>
      ) : (
        content
      )}
    </div>
  );
}
