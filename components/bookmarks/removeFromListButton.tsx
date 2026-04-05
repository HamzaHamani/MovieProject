"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import { showErrorNotification } from "@/components/notificationSystem";
import { showProfileMovieToast } from "@/components/profile/profileToasts";

export default function RemoveFromListButton({
  bookmarkId,
  listName,
  movieId,
  title,
  posterPath,
}: {
  bookmarkId: string;
  listName: string;
  movieId: string;
  title: string;
  posterPath: string | null;
}) {
  const [isRemoving, setIsRemoving] = useState(false);
  const router = useRouter();

  const handleRemove = async () => {
    try {
      setIsRemoving(true);
      const response = await fetch("/api/bookmarks/list-remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookmarkId, movieId }),
      });

      const json = (await response.json()) as {
        removed?: boolean;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(json.error ?? "Could not remove movie");
      }

      if (json.removed) {
        showProfileMovieToast({
          title,
          message: `Removed from ${listName}`,
          posterPath,
        });
      }

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
