import { NextRequest, NextResponse } from "next/server";
import { getUser, markNotificationAsRead } from "@/lib/actions";

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { notificationId?: string };
    const notificationId = String(body?.notificationId ?? "").trim();

    if (!notificationId) {
      return NextResponse.json(
        { error: "notificationId is required" },
        { status: 400 },
      );
    }

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
