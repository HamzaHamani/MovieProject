import { useQuery } from "@tanstack/react-query";
import { getLoggedMoviesForUser } from "@/lib/actions";
import { decodeStoredMediaId } from "@/lib/utils";

export type WatchedMediaItem = {
  id: string;
  showId: string;
  rating: number | null;
  review: string;
  watchedAt: Date;
  createdAt: Date | null;
  watchType: "first" | "rewatch";
  mediaType: "movie" | "tv" | null;
};

export function useWatchedMedia(userId: string) {
  return useQuery({
    queryKey: ["watchedMedia", userId],
    queryFn: async () => {
      const loggedMovies = await getLoggedMoviesForUser(userId);
      
      return loggedMovies.map((item) => {
        const decoded = decodeStoredMediaId(item.showId);
        return {
          ...item,
          mediaType: (decoded.mediaType as "movie" | "tv" | null) ?? null,
        };
      });
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });
}
