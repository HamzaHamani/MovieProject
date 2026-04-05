import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getUser,
  acceptCollaborationInvite,
  declineCollaborationInvite,
  inviteCollaborator,
} from "@/lib/actions";

const requestSchema = z.object({
  action: z.enum(["accept", "decline", "invite"]),
  bookmarkId: z.string(),
  invitedUserId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const { action, bookmarkId, invitedUserId } = parsed.data;

    if (action === "accept") {
      const result = await acceptCollaborationInvite(bookmarkId);
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || "Failed to accept invite" },
          { status: 400 },
        );
      }
      return NextResponse.json({ success: true });
    }

    if (action === "decline") {
      const result = await declineCollaborationInvite(bookmarkId);
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || "Failed to decline invite" },
          { status: 400 },
        );
      }
      return NextResponse.json({ success: true });
    }

    if (action === "invite") {
      if (!invitedUserId) {
        return NextResponse.json(
          { error: "invitedUserId is required" },
          { status: 400 },
        );
      }
      const result = await inviteCollaborator(bookmarkId, invitedUserId);
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || "Failed to invite" },
          { status: 400 },
        );
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error in collaborators route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
