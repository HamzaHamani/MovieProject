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
