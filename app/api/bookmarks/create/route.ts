import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { CreateBookmark, getUser } from "@/lib/actions";

const requestSchema = z.object({
  bookmarkName: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(400),
  isPublic: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid list payload" },
        { status: 400 },
      );
    }

    const bookmarkName = parsed.data.bookmarkName;
    const description = parsed.data.description;
    const isPublic = parsed.data.isPublic !== false;

    const created = await CreateBookmark({
      bookmarkName,
      description,
      userId: user.id,
      isPublic,
    });

    return NextResponse.json({ id: created.id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not create list";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
