"use client";

import { TExistingLog } from "@/lib/actions";
import { Star, Heart, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { getUserUsername } from "@/lib/actions";
import Link from "next/link";

type Props = {
  log: TExistingLog | null;
  username?: string | null;
  mediaType: "movie" | "tv";
  likesCount?: number;
  repliesCount?: number;
};

export default function UserReviewPreview({
  log,
  username,
  mediaType,
  likesCount = 0,
  repliesCount = 0,
}: Props) {
  const [newUsername, setNewUsername] = useState<string | null>(null);
  useEffect(() => {
    getUserUsername().then(setNewUsername);
  }, []);
  if (!log) return null;
  console.log("Username in UserReviewPreview:", username);
  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-white">Your Review</h4>
          <span className="rounded-full border border-primaryM-500/50 bg-primaryM-500/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primaryM-300">
            You
          </span>
        </div>
        <div className="text-xs text-gray-400">
          {new Date(log.watchedAt).toLocaleDateString()}
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < log.rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-600"
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-gray-300">
          {log.rating.toFixed(1)}
        </span>
      </div>

      {log.review && (
        <p className="mb-3 line-clamp-4 whitespace-pre-wrap text-sm text-gray-300">
          {log.review}
        </p>
      )}

      <div className="mb-3 flex items-center gap-3">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Heart className="h-4 w-4" />
          <span>{likesCount}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <MessageCircle className="h-4 w-4" />
          <span>{repliesCount}</span>
        </div>
      </div>

      {username && (
        <Link
          href={`/profile/${username}/review/${log.id}`}
          className="inline-block text-xs text-primaryM-400 hover:text-primaryM-300"
        >
          Check the review →
        </Link>
      )}
    </div>
  );
}
