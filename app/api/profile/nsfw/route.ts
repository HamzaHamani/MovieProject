import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ show_nsfw: false });

    const rows = await db
      .select({ showNsfw: users.showNsfw })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    const showNsfw = rows[0]?.showNsfw ?? false;
    return NextResponse.json({ show_nsfw: Boolean(showNsfw) });
  } catch (err) {
    return NextResponse.json({ show_nsfw: false });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ ok: false }, { status: 401 });

    const body = await req.json();
    const show_nsfw = Boolean(body.show_nsfw);

    await db
      .update(users)
      .set({ showNsfw: show_nsfw })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({ ok: true, show_nsfw });
  } catch (err) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
