import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSiteRequest } from "@/lib/actions";
import { checkRateLimit } from "@/lib/securityRateLimit";

const requestSchema = z.object({
  title: z.string().trim().min(1).max(120),
  message: z.string().trim().min(1).max(5000),
});

export async function POST(request: NextRequest) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
    const ip = forwardedFor.split(",")[0]?.trim() || "unknown";
    const ipRate = checkRateLimit(`site-request:${ip}`, {
      windowMs: 60_000,
      max: 20,
    });

    if (!ipRate.allowed) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please try again shortly." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Title and message are required.",
        },
        { status: 400 },
      );
    }

    const result = await createSiteRequest(parsed.data);

    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not submit your request right now." },
      { status: 500 },
    );
  }
}
