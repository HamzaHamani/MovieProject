import { NextRequest, NextResponse } from "next/server";

import { updateMyProfile } from "@/lib/actions";
import { checkRateLimit } from "@/lib/securityRateLimit";

export async function POST(request: NextRequest) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
    const ip = forwardedFor.split(",")[0]?.trim() || "unknown";
    const ipRate = checkRateLimit(`profile:update:${ip}`, {
      windowMs: 60_000,
      max: 30,
    });

    if (!ipRate.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a minute." },
        { status: 429 },
      );
    }

    const body = (await request.json()) as {
      username?: string;
      bio?: string | null;
      image?: string | null;
      backdropPath?: string | null;
    };

    const result = await updateMyProfile({
      username: body?.username,
      bio: body?.bio ?? null,
      image: body?.image ?? null,
      backdropPath: body?.backdropPath ?? null,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update profile";

    if (message.toLowerCase().includes("not authenticated")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
