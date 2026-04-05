import { NextRequest, NextResponse } from "next/server";

import { followUserByUsername, unfollowUserByUsername } from "@/lib/actions";

type ActionType = "follow" | "unfollow";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      username?: string;
      action?: ActionType;
    };

    const username = String(body?.username ?? "").trim();
    const action = body?.action;

    if (!username || (action !== "follow" && action !== "unfollow")) {
      return NextResponse.json(
        { error: "username and valid action are required" },
        { status: 400 },
      );
    }

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
