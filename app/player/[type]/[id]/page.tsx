import PlayerShell from "@/components/player/PlayerShell";
import { getSpecifiedMovie, getSpecifiedTV } from "@/lib/actions";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ type: string; id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({ params, searchParams }: Props) {
  const { type, id } = await params;
  const resolved = searchParams ? await searchParams : undefined;

  if (type !== "movie" && type !== "tv") return notFound();

  try {
    if (type === "movie") {
      const movie = await getSpecifiedMovie(id);
      if (!movie) return notFound();
      return (
        <PlayerShell
          typeM="movie"
          tmdbId={movie.id}
          imdbId={movie.imdb_id ?? null}
          title={movie.title}
          posterPath={movie.poster_path}
          backdropPath={movie.backdrop_path}
        />
      );
    }

    const tv = await getSpecifiedTV(id);
    if (!tv) return notFound();
    const season = resolved?.season
      ? Number(
          Array.isArray(resolved.season) ? resolved.season[0] : resolved.season,
        )
      : undefined;
    const episode = resolved?.episode
      ? Number(
          Array.isArray(resolved.episode)
            ? resolved.episode[0]
            : resolved.episode,
        )
      : undefined;
    return (
      <PlayerShell
        typeM="tv"
        tmdbId={tv.id}
        title={tv.name}
        posterPath={tv.poster_path}
        backdropPath={tv.backdrop_path}
        seasons={tv.seasons}
        initialSeason={Number.isInteger(season) ? season : undefined}
        initialEpisode={Number.isInteger(episode) ? episode : undefined}
      />
    );
  } catch (e) {
    notFound();
  }
}

// Prevent indexing of player pages
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
