import { NextResponse } from "next/server";
import { updateBookmarkDetails } from "@/lib/actions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bookmarkId, bookmarkName, description, isPublic } = body;
    if (!bookmarkId || !bookmarkName) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await updateBookmarkDetails({
      bookmarkId,
      bookmarkName,
      description,
      isPublic,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 },
    );
  }
}
