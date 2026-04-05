"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { showErrorNotification } from "@/components/notificationSystem";

export default function ListLikeButton({
  listId,
  initialLiked,
  initialLikesCount,
}: {
  listId: string;
  initialLiked: boolean;
  initialLikesCount: number;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/list/toggle-like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId }),
      });

      const json = (await response.json()) as {
        liked?: boolean;
        likesCount?: number;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(json.error ?? "Could not update like");
      }

      const nextLiked = Boolean(json.liked);
      setLiked(nextLiked);
      setLikesCount(Number(json.likesCount ?? likesCount));
      router.refresh();
    } catch (error) {
      showErrorNotification(
        "Error",
        error instanceof Error ? error.message : "Like failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleToggle()}
      disabled={loading}
      className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
        liked
          ? "border-rose-400/60 bg-rose-500/20 text-rose-200"
          : "border-white/20 bg-white/5 text-white hover:bg-white/10"
      }`}
      aria-pressed={liked}
    >
      <Heart
        className={`h-4 w-4 ${liked ? "fill-rose-300 text-rose-300" : "text-white/80"}`}
      />
      <span>{likesCount}</span>
    </button>
  );
}
