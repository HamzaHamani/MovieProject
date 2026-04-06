import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
// const api_key = process.env.TMDB_API_KEY!;
// console.log(api_key);

// const res = fetch(
//   `https://api.themoviedb.org/3/movie/157336?language=en-US&api_key=${api_key}`
// );
export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function convertRuntime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Media type for stored IDs (movie or tv)
 */
export type StoredMediaType = "movie" | "tv";

/**
 * Encodes a media ID with its type for storage
 * Converts: 123 + "tv" → "tv:123"
 */
export function encodeStoredMediaId(
  id: string | number,
  mediaType?: StoredMediaType,
) {
  const cleanId = String(id).trim();
  if (!cleanId) return cleanId;
  return mediaType ? `${mediaType}:${cleanId}` : cleanId;
}

/**
 * Decodes a stored media ID and extracts its type
 * Converts: "tv:123" → { id: "123", mediaType: "tv" }
 * Converts: "123" → { id: "123", mediaType: null }
 */
export function decodeStoredMediaId(storedId: string) {
  const value = String(storedId ?? "").trim();

  if (value.startsWith("movie:")) {
    return { id: value.slice("movie:".length), mediaType: "movie" as const };
  }

  if (value.startsWith("tv:")) {
    return { id: value.slice("tv:".length), mediaType: "tv" as const };
  }

  return { id: value, mediaType: null };
}
