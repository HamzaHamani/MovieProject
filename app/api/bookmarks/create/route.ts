import { NextRequest, NextResponse } from "next/server";

import { CreateBookmark, getUser } from "@/lib/actions";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = (await request.json()) as {
      bookmarkName?: string;
      description?: string;
    };

    const bookmarkName = String(body?.bookmarkName ?? "").trim();
    const description = String(body?.description ?? "").trim();

    if (bookmarkName.length < 2) {
      return NextResponse.json(
        { error: "List name must be at least 2 characters" },
        { status: 400 },
      );
    }

    if (description.length < 10) {
      return NextResponse.json(
        { error: "Description must be at least 10 characters" },
        { status: 400 },
      );
    }

    const created = await CreateBookmark({
      bookmarkName,
      description,
      userId: user.id,
    });

    return NextResponse.json({ id: created.id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not create list";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
