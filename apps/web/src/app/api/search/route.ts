import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { searchArticles } from "@/lib/data/articles";

const querySchema = z.object({
  q: z.string().trim().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

/**
 * Deliberately thin: validate, call the same searchArticles() the /search
 * page itself calls server-side, return JSON. If Postgres FTS is ever
 * swapped for Algolia/Meilisearch, only searchArticles' internals change —
 * this route and every caller of it stay the same. See ARCHITECTURE.md's
 * API Architecture section.
 */
export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse({
    q: request.nextUrl.searchParams.get("q"),
    limit: request.nextUrl.searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Provide a search query via ?q=" },
      { status: 400 },
    );
  }

  const results = await searchArticles(parsed.data.q, parsed.data.limit ?? 20);
  return NextResponse.json({ query: parsed.data.q, results });
}
