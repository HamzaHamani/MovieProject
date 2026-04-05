"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  showSuccessNotification,
  showErrorNotification,
} from "@/components/notificationSystem";

export default function FollowToggleButton({
  username,
  initialFollowing,
}: {
  username: string;
  initialFollowing: boolean;
}) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const toggleFollow = async () => {
    try {
      setIsLoading(true);
      const nextAction = isFollowing ? "unfollow" : "follow";

      const response = await fetch("/api/profile/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, action: nextAction }),
      });

      const json = (await response.json()) as {
        isFollowing?: boolean;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(json.error ?? "Could not update follow state");
      }

      const nextFollowing = Boolean(json.isFollowing);
      setIsFollowing(nextFollowing);
      showSuccessNotification(
        `@${username}`,
        nextFollowing ? "Followed" : "Unfollowed",
      );

      // Refresh server-rendered social counts (followers/following/friends).
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Request failed";
      showErrorNotification("Follow Error", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={() => void toggleFollow()}
      disabled={isLoading}
      variant={isFollowing ? "outline" : "default"}
      className={
        isFollowing
          ? "h-8 border-white/20 bg-white/5 px-3 text-xs text-white hover:bg-white/10"
          : "h-8 bg-primaryM-500 px-3 text-xs text-black hover:bg-primaryM-600"
      }
    >
      {isFollowing ? "Followed" : "Follow"}
    </Button>
  );
}
