"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import { showProfileMovieToast } from "@/components/profile/profileToasts";
import { showErrorNotification } from "@/components/notificationSystem";

type SectionType = "favorites" | "likes" | "watchlist";

const sectionLabels: Record<SectionType, string> = {
  favorites: "Favorites",
  likes: "Movies I Like",
  watchlist: "Watchlist",
};

export default function RemoveFromSectionButton({
  section,
  movieId,
  title,
  posterPath,
}: {
  section: SectionType;
  movieId: string;
  title: string;
  posterPath: string | null;
}) {
  const [isRemoving, setIsRemoving] = useState(false);
  const router = useRouter();

  const handleRemove = async () => {
    try {
      setIsRemoving(true);
      const response = await fetch("/api/profile/section-remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, movieId }),
      });

      const json = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(json.error ?? "Could not remove movie");
      }

      showProfileMovieToast({
        title,
        message: `Removed from ${sectionLabels[section]}`,
        posterPath,
      });
      router.refresh();
    } catch (error) {
      showErrorNotification(
        "Error",
        error instanceof Error ? error.message : "Remove failed",
      );
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <button
      type="button"
      aria-label={`Remove ${title}`}
      disabled={isRemoving}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void handleRemove();
      }}
      className="absolute right-1.5 top-1.5 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-red-400/50 bg-red-500/90 text-white shadow transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <X className="h-4 w-4" />
    </button>
  );
}
