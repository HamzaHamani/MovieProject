"use client";

import { useEffect, useState } from "react";
import { Bell, Check, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getUnreadNotificationCount,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/actions";
import { format } from "date-fns";

type Notification = Awaited<ReturnType<typeof getUserNotifications>>[number];

export default function NotificationBell() {
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [count, notifs] = await Promise.all([
          getUnreadNotificationCount(),
          getUserNotifications(10),
        ]);
        setUnreadCount(count);
        setNotifications(notifs);
      } catch (error) {
        console.error("Failed to load notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Near real-time polling without websockets.
    const interval = setInterval(loadData, 30000);

    const refreshOnFocus = () => {
      void loadData();
    };

    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", refreshOnFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", refreshOnFocus);
      document.removeEventListener("visibilitychange", refreshOnFocus);
    };
  }, [mounted, isOpen]);

  if (!mounted) {
    return (
      <button
        type="button"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-textMain" />
      </button>
    );
  }

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleCollabInviteResponse = async (
    notificationId: string,
    bookmarkId: string,
    action: "accept" | "decline",
  ) => {
    try {
      const response = await fetch("/api/collaborators/manage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          bookmarkId,
        }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        const normalizedError = payload.error?.toLowerCase() ?? "";
        const alreadyHandled =
          normalizedError.includes("already accepted") ||
          normalizedError.includes("invitation not found");

        if (alreadyHandled) {
          await handleMarkAsRead(notificationId);
          return;
        }

        throw new Error(payload.error ?? "Request failed");
      }

      await handleMarkAsRead(notificationId);
    } catch (error) {
      console.error("Failed to respond to collaboration invite:", error);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 transition-colors hover:bg-white/10"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-textMain" />
          {unreadCount > 0 && (
            <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[24rem] overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(234,179,8,0.12),transparent_40%),linear-gradient(180deg,rgba(12,12,12,0.98)_0%,rgba(8,8,8,0.98)_100%)] p-0 text-textMain shadow-[0_24px_90px_rgba(0,0,0,0.45)]"
        align="end"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
              Activity
            </p>
            <h3 className="text-lg font-semibold text-white">Notifications</h3>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-8 rounded-full border border-white/10 bg-white/[0.04] px-3 text-xs text-gray-300 hover:bg-white/[0.08] hover:text-white"
            >
              Mark all as read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-primaryM-500" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex items-center justify-center px-6 py-10 text-center text-gray-400">
            <div>
              <p className="text-sm text-white">Nothing new yet</p>
              <p className="mt-1 text-xs text-gray-400">
                Follows, likes, replies, and collaboration updates will appear
                here.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-h-[420px] overflow-y-auto p-2">
            {notifications.map((notif, idx) => (
              <div key={notif.id} className="mb-2 last:mb-0">
                <div
                  className={`rounded-2xl border p-3 transition-all hover:-translate-y-[1px] hover:border-white/20 hover:bg-white/[0.06] ${
                    !notif.isRead
                      ? "border-white/15 bg-white/[0.05]"
                      : "border-white/8 bg-black/20"
                  }`}
                  onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                >
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10 shrink-0 ring-1 ring-white/10">
                      <AvatarImage src={notif.sourceUserImage ?? undefined} />
                      <AvatarFallback className="bg-white/10 text-xs text-white">
                        {notif.sourceUserName?.slice(0, 2)?.toUpperCase() ??
                          "N"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="truncate text-sm font-semibold text-white">
                            {notif.sourceUserName ?? "Unknown"}
                          </p>
                          <p className="mt-1 line-clamp-2 text-sm text-gray-300">
                            {notif.message}
                          </p>
                          <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-gray-500">
                            {notif.createdAt
                              ? format(
                                  new Date(notif.createdAt),
                                  "MMM d, h:mm a",
                                )
                              : ""}
                          </p>
                        </div>
                        {!notif.isRead && (
                          <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primaryM-500 shadow-[0_0_0_4px_rgba(234,179,8,0.12)]" />
                        )}
                      </div>
                      {notif.type === "collab_invite" && !notif.isRead && (
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            className="h-8 rounded-full bg-primaryM-500 px-3 text-xs text-black hover:bg-primaryM-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!notif.referenceId) return;
                              void handleCollabInviteResponse(
                                notif.id,
                                notif.referenceId,
                                "accept",
                              );
                            }}
                          >
                            <Check className="mr-1 h-3 w-3" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 rounded-full border-white/15 bg-white/[0.03] px-3 text-xs text-gray-300 hover:bg-white/[0.08] hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!notif.referenceId) return;
                              void handleCollabInviteResponse(
                                notif.id,
                                notif.referenceId,
                                "decline",
                              );
                            }}
                          >
                            <X className="mr-1 h-3 w-3" />
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
