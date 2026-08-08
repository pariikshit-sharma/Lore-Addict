export function JsonLd({ data }: { data: object }) {
  // JSON.stringify does not escape "</script>" - a title or excerpt
  // containing that literal string could otherwise break out of the tag.
  // This is the standard mitigation for embedding JSON-LD safely.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- structured data is
      // generated server-side from our own fields, not raw user HTML.
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
