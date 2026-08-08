import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const requestSchema = z.object({
  paths: z.array(z.string()).min(1).max(20),
});

export async function POST(request: Request) {
  const secret = request.headers.get("x-revalidate-secret");
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  for (const path of parsed.data.paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: true, paths: parsed.data.paths });
}
