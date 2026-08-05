import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUser, markNotificationAsRead } from "@/lib/actions";

const requestSchema = z.object({
  notificationId: z.string().trim().min(1),
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
        { error: "notificationId is required" },
        { status: 400 },
      );
    }

    const notificationId = parsed.data.notificationId;

    const result = await markNotificationAsRead(notificationId);

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to mark notification as read" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
