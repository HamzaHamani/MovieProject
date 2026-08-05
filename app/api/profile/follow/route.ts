import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { followUserByUsername, unfollowUserByUsername } from "@/lib/actions";

type ActionType = "follow" | "unfollow";

const requestSchema = z.object({
  username: z.string().trim().min(1),
  action: z.enum(["follow", "unfollow"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "username and valid action are required" },
        { status: 400 },
      );
    }

    const username = parsed.data.username;
    const action: ActionType = parsed.data.action;

    if (action === "follow") {
      const result = await followUserByUsername(username);
      if (!result.ok) {
        return NextResponse.json(
          { error: result.reason ?? "Could not follow user" },
          { status: 400 },
        );
      }
      return NextResponse.json({ ok: true, isFollowing: true });
    }

    const result = await unfollowUserByUsername(username);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.reason ?? "Could not unfollow user" },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true, isFollowing: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";

    if (message.toLowerCase().includes("not authenticated")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
