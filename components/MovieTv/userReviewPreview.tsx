"use client";
import { TExistingLog } from "@/lib/actions";
import { Star, Heart, MessageCircle } from "lucide-react";
import Link from "next/link";

type Props = {
  log: TExistingLog | null;
  username?: string | null;
  likesCount?: number;
  repliesCount?: number;
  className?: string;
};

export default function UserReviewPreview({
  log,
  username,
  likesCount = 0,
  repliesCount = 0,
  className,
}: Props) {
  if (!log) return null;

  return (
    <div
      className={`mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 lg:mt-0 ${className ?? ""}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-[10px] font-medium uppercase tracking-widest text-white/30">
          Your review
        </span>
        <span className="text-[11px] text-white/30">
          {new Date(log.watchedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${
                i < Math.floor(log.rating)
                  ? "fill-primaryM-400 text-primaryM-400"
                  : i < log.rating
                    ? "fill-primaryM-400/50 text-primaryM-400"
                    : "fill-transparent text-white/15"
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-primaryM-400">
          {log.rating.toFixed(1)}
        </span>
      </div>

      {log.review && (
        <p className="mb-3 line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-white/55">
          {log.review}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-white/30">
            <Heart className="h-3.5 w-3.5" />
            <span>{likesCount}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/30">
            <MessageCircle className="h-3.5 w-3.5" />
            <span>{repliesCount}</span>
          </div>
        </div>
        {username && (
          <Link
            href={`/profile/${username}/review/${log.id}`}
            className="flex items-center gap-1 rounded-lg bg-primaryM-500/10 px-2.5 py-1 text-xs text-primaryM-400 transition hover:bg-primaryM-500/20"
          >
            Full review →
          </Link>
        )}
      </div>
    </div>
  );
}
