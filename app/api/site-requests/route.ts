import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createSiteRequest, getUser } from "@/lib/actions";
import { checkRateLimit } from "@/lib/securityRateLimit";

const requestSchema = z.object({
  title: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(2000),
});

export async function POST(request: NextRequest) {
  const user = await getUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
    const ip = forwardedFor.split(",")[0]?.trim() || "unknown";
    const rate = checkRateLimit(`site-request:submit:${ip}`, {
      windowMs: 60_000,
      max: 6,
    });

    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a minute." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message ?? "Invalid request data";
      return NextResponse.json({ error: issue }, { status: 400 });
    }

    const result = await createSiteRequest({
      title: parsed.data.title,
      message: parsed.data.message,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "Could not submit request" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}