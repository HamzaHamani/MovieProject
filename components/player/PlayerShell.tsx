"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type Season = {
  season_number: number;
  episode_count: number;
  poster_path?: string | null;
};

type Props = {
  typeM: "movie" | "tv";
  tmdbId: number;
  imdbId?: string | null;
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  seasons?: Season[] | null;
  initialSeason?: number | null;
  initialEpisode?: number | null;
};

export default function PlayerShell({
  typeM,
  tmdbId,
  imdbId,
  title,
  posterPath,
  backdropPath,
  seasons,
  initialSeason = null,
  initialEpisode = null,
}: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialEmbed = Number(
    searchParams?.get("e") ?? searchParams?.get("embed") ?? "1",
  );
  const initialSeasonParam = Number(
    searchParams?.get("s") ?? searchParams?.get("season") ?? "",
  );
  const initialEpisodeParam = Number(
    searchParams?.get("ep") ?? searchParams?.get("episode") ?? "",
  );

  const [embedIndex, setEmbedIndex] = useState<number>(
    Number.isInteger(initialEmbed) && initialEmbed > 0 ? initialEmbed : 1,
  );
  const availableSeasons = seasons ?? [];
  const [season, setSeason] = useState<number | null>(
    Number.isInteger(initialSeasonParam) && initialSeasonParam > 0
      ? initialSeasonParam
      : initialSeason ?? availableSeasons[0]?.season_number ?? null,
  );
  const [episode, setEpisode] = useState<number | null>(
    Number.isInteger(initialEpisodeParam) && initialEpisodeParam > 0
      ? initialEpisodeParam
      : initialEpisode ?? 1,
  );

  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [triedMap, setTriedMap] = useState<Record<number, Set<string>>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lightsOff, setLightsOff] = useState<boolean>(false);
  const [theaterMode, setTheaterMode] = useState<boolean>(false);
  const isSmall = useMediaQuery("(max-width:640px)");
  const [hideMobileModal, setHideMobileModal] = useState<boolean>(() => {
    try {
      return (
        typeof window !== "undefined" &&
        sessionStorage.getItem("player_mobile_warning_dismissed") === "1"
      );
    } catch {
      return false;
    }
  });
  const [modalExiting, setModalExiting] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("player_disclaimer_dismissed") !== "1";
    } catch {
      return true;
    }
  });

  const posterUrl = posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : undefined;
  const backdropUrl = backdropPath
    ? `https://image.tmdb.org/t/p/original${backdropPath}`
    : undefined;

  const episodeCountForSeason = useMemo(() => {
    if (!season) return 1;
    const s = availableSeasons.find((x) => x.season_number === season);
    return s?.episode_count ?? 1;
  }, [season, availableSeasons]);

  const titleLabel =
    typeM === "tv" && season
      ? `${title} • Season ${season} • Episode ${episode ?? 1}`
      : title;

  useEffect(() => {
    if (typeM !== "tv") return;
    if (episode !== null && episode > episodeCountForSeason) setEpisode(1);
  }, [episode, episodeCountForSeason, typeM]);

  function buildEmbedUrl(idx: number) {
    if (idx === 1) {
      if (imdbId) {
        if (typeM === "tv") {
          return `https://multiembed.mov/?video_id=${encodeURIComponent(imdbId)}${season ? `&s=${season}&e=${episode ?? 1}` : ""}`;
        }
        return `https://multiembed.mov/?video_id=${encodeURIComponent(imdbId)}`;
      }
      if (typeM === "tv") {
        return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1${season ? `&s=${season}&e=${episode ?? 1}` : ""}`;
      }
      return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`;
    }

    if (idx === 2) {
      // Use vidfast.pro as Embed 2 with theme parameter set to primary color
      const theme = "f5cf4d"; // primaryM-500
      if (typeM === "movie") {
        // vidfast movie URL: /movie/{id}
        return imdbId
          ? `https://vidfast.pro/movie/${encodeURIComponent(imdbId)}?theme=${theme}`
          : `https://vidfast.pro/movie/${tmdbId}?theme=${theme}`;
      }

      // tv: /tv/{id}/{season}/{episode}
      return imdbId
        ? `https://vidfast.pro/tv/${encodeURIComponent(imdbId)}/${season ?? 1}/${episode ?? 1}?theme=${theme}`
        : `https://vidfast.pro/tv/${tmdbId}/${season ?? 1}/${episode ?? 1}?theme=${theme}`;
    }

    if (idx === 3) {
      return typeM === "tv"
        ? `https://player.embed-api.stream/?id=${tmdbId}${season ? `&s=${season}&e=${episode ?? 1}` : ""}`
        : `https://player.embed-api.stream/?id=${tmdbId}`;
    }

    if (idx === 4) {
      // 2embed.online
      if (typeM === "movie") {
        return imdbId
          ? `https://www.2embed.online/embed/movie/${encodeURIComponent(imdbId)}`
          : `https://www.2embed.online/embed/movie/${tmdbId}`;
      }
      return imdbId
        ? `https://www.2embed.online/embed/tv/${encodeURIComponent(imdbId)}/${season ?? 1}/${episode ?? 1}`
        : `https://www.2embed.online/embed/tv/${tmdbId}/${season ?? 1}/${episode ?? 1}`;
    }

    if (idx === 5) {
      // 2embed.cc patterns
      if (typeM === "movie") {
        return imdbId
          ? `https://www.2embed.cc/embed/${encodeURIComponent(imdbId)}`
          : `https://www.2embed.cc/embed/${tmdbId}`;
      }
      return imdbId
        ? `https://www.2embed.cc/embedtv/${encodeURIComponent(imdbId)}?s=${season ?? 1}&e=${episode ?? 1}`
        : `https://www.2embed.cc/embedtv/${tmdbId}?s=${season ?? 1}&e=${episode ?? 1}`;
    }

    return "";
  }

  const src = buildEmbedUrl(embedIndex);

  function getAlternatesForEmbed(idx: number) {
    const primary = buildEmbedUrl(idx);
    const alternates: string[] = [primary];

    if (idx === 2) {
      // provide vidsrc-embed.ru as alternate for vidfast (some hosts lack certain content)
      if (typeM === "movie") {
        if (imdbId)
          alternates.push(
            `https://vidsrc-embed.ru/embed/movie?imdb=${encodeURIComponent(imdbId)}`,
          );
        alternates.push(`https://vidsrc-embed.ru/embed/movie/${tmdbId}`);
      } else {
        if (imdbId)
          alternates.push(
            `https://vidsrc-embed.ru/embed/tv?imdb=${encodeURIComponent(imdbId)}&season=${season ?? 1}&episode=${episode ?? 1}`,
          );
        alternates.push(
          `https://vidsrc-embed.ru/embed/tv/${tmdbId}/${season ?? 1}-${episode ?? 1}`,
        );
      }
    }

    if (idx === 1) {
      // try tmdb vs imdb variants
      if (imdbId)
        alternates.push(
          `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1${season ? `&s=${season}&e=${episode ?? 1}` : ""}`,
        );
    }

    if (idx === 3) {
      // small alternative format
      alternates.push(
        `https://player.embed-api.stream/?id=${tmdbId}${season ? `&s=${season}&e=${episode ?? 1}` : ""}`,
      );
    }

    // remove duplicates
    return Array.from(new Set(alternates));
  }

  useEffect(() => {
    // when embedIndex or season/episode changes, reset tried set for this embed
    setTriedMap((prev) => ({ ...prev, [embedIndex]: new Set<string>() }));
    const candidates = getAlternatesForEmbed(embedIndex);
    const first = candidates[0] ?? "";
    setIframeSrc(first || null);
    setLoading(true);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [embedIndex, season, episode]);

  function handleEmbedError() {
    const candidates = getAlternatesForEmbed(embedIndex);
    const tried = triedMap[embedIndex] ?? new Set<string>();

    // mark current iframeSrc as tried
    if (iframeSrc) tried.add(iframeSrc);

    // find next candidate for same embed that hasn't been tried
    const nextSame = candidates.find((c) => !tried.has(c));
    if (nextSame) {
      // try next URL on same embed (change server)
      setTriedMap((prev) => ({
        ...prev,
        [embedIndex]: new Set<string>(tried),
      }));
      setIframeSrc(nextSame);
      setLoading(true);
      setError(null);
      return;
    }

    // otherwise fall back to next embed
    if (embedIndex < 5) {
      setEmbedIndex((current) => Math.min(current + 1, 5));
      return;
    }

    setLoading(false);
    setError("This embed failed to load. Try another embed.");
  }

  // Update URL query params (replace to avoid back-history entries)
  useEffect(() => {
    if (!router || !pathname) return;
    const params = new URLSearchParams(
      Object.fromEntries(searchParams?.entries() ?? []),
    );
    params.set("e", String(embedIndex));
    if (season) params.set("s", String(season));
    else params.delete("s");
    if (episode) params.set("ep", String(episode));
    else params.delete("ep");
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [embedIndex, season, episode]);

  return (
    <div
      className="relative h-screen w-full bg-cover bg-center"
      style={{
        backgroundImage: backdropUrl ? `url(${backdropUrl})` : undefined,
      }}
    >
      <div className="absolute inset-0 bg-black/60" />

      {/* Top banner: general player disclaimer */}
      {showDisclaimer && (
        <div className="fixed left-1/2 top-4 z-[70] w-[95%] max-w-[1200px] -translate-x-1/2 rounded-md border border-white/10 bg-red-500/95 px-4 py-2 shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <p className="max-w-[95%] text-xs text-gray-200">
              If the player doesn't work, try changing the server or switching
              to a different embed. Some embeds don't include anime — try
              switching between them.
            </p>
            <button
              aria-label="Dismiss disclaimer"
              onClick={() => {
                try {
                  sessionStorage.setItem("player_disclaimer_dismissed", "1");
                } catch {}
                setShowDisclaimer(false);
              }}
              className="ml-4 rounded-full bg-white/10 px-2 py-1 text-xs font-semibold text-white hover:bg-white/20"
            >
              X
            </button>
          </div>
        </div>
      )}

      {/* Mobile warning modal */}
      {isSmall && !hideMobileModal && (
        <div
          className={`absolute inset-0 z-[60] flex items-center justify-center p-4 ${modalExiting ? "pointer-events-none" : ""}`}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className={`relative z-50 w-full max-w-md transform rounded-lg border border-white/10 bg-backgroundM p-4 text-white shadow-2xl backdrop-blur-md transition-all duration-300 ${modalExiting ? "scale-95 opacity-0" : "scale-100 opacity-100"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <strong className="block text-sm text-white">
                  Small screen notice
                </strong>
                <p className="mt-1 text-xs text-gray-200">
                  Player works best on larger screens. Video may be constrained
                  on mobile. Tap X to dismiss.
                </p>
              </div>
              <button
                aria-label="Dismiss mobile warning"
                onClick={() => {
                  setModalExiting(true);
                  setTimeout(() => {
                    try {
                      sessionStorage.setItem(
                        "player_mobile_warning_dismissed",
                        "1",
                      );
                    } catch {}
                    setHideMobileModal(true);
                    setModalExiting(false);
                  }, 260);
                }}
                className="ml-2 rounded-full bg-primaryM-500 px-3 py-1 text-xs font-semibold text-black shadow-md"
              >
                X
              </button>
            </div>
          </div>
        </div>
      )}

      {lightsOff && <div className="absolute inset-0 z-[5] bg-black/90" />}

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1400px] items-center justify-center px-4">
        <div className="w-full">
          <div
            className={`mx-auto transition-all duration-300 ${theaterMode ? "w-full max-w-[1600px]" : "w-[88%] max-w-[1200px]"}`}
          >
            <div className="relative">
              <div className="mb-3 flex items-start justify-between gap-4 px-2 lg:flex-col">
                <div className="min-w-0 pr-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/55">
                    Now playing
                  </p>
                  <h1 className="mt-1 truncate text-2xl font-semibold text-white lg:text-xl sm:text-lg">
                    {titleLabel}
                  </h1>
                </div>

                {typeM === "tv" && (
                  <div className="flex flex-nowrap items-center gap-2 pt-1">
                    <Select
                      value={season ? String(season) : undefined}
                      onValueChange={(value) => {
                        const nextSeason = Number(value);
                        setSeason(nextSeason);
                        setEpisode(1);
                      }}
                    >
                      <SelectTrigger className="h-10 min-w-[150px] rounded-full border-white/15 bg-white/[0.04] text-sm text-white shadow-none transition hover:border-primaryM-500 hover:text-primaryM-500 focus:border-primaryM-500 focus:text-white data-[state=open]:text-white">
                        <SelectValue placeholder="Season" />
                      </SelectTrigger>
                      <SelectContent className="border-white/10 bg-[#0d0c0f] text-white">
                        {availableSeasons.map((item) => (
                          <SelectItem
                            key={item.season_number}
                            value={String(item.season_number)}
                            className="hover:bg-primaryM-500"
                          >
                            Season {item.season_number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={episode ? String(episode) : undefined}
                      onValueChange={(value) => setEpisode(Number(value))}
                      disabled={!season}
                    >
                      <SelectTrigger className="h-10 min-w-[150px] rounded-full border-white/15 bg-white/[0.04] text-sm text-white shadow-none transition hover:border-primaryM-500 hover:text-primaryM-500 focus:border-primaryM-500 focus:text-white disabled:opacity-60 data-[state=open]:text-white">
                        <SelectValue placeholder="Episode" />
                      </SelectTrigger>
                      <SelectContent className="border-white/10 bg-backgroundM text-white">
                        {Array.from(
                          { length: episodeCountForSeason },
                          (_, i) => i + 1,
                        ).map((item) => (
                          <SelectItem key={item} value={String(item)}>
                            Episode {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div
                className={`mx-auto aspect-video w-full overflow-hidden rounded-md border border-white/10 bg-black shadow-2xl transition-all duration-300 ${theaterMode ? "max-h-[88vh]" : "max-h-[80vh]"}`}
              >
                {loading && (
                  <div className="flex h-full w-full items-center justify-center bg-[#0b0b0f] p-4">
                    <div className="flex h-full w-full animate-pulse flex-col rounded-md border border-white/10 bg-black/70 p-4">
                      <div className="mb-3 h-10 w-full rounded-md bg-white/5" />
                      <div className="flex-1 rounded-md bg-gradient-to-br from-white/5 via-white/[0.03] to-white/5" />
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="h-4 w-32 rounded bg-white/10" />
                        <div className="h-4 w-20 rounded bg-white/10" />
                      </div>
                    </div>
                  </div>
                )}

                {!loading && error && (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-black/80 text-center">
                    <p className="text-sm text-red-400">{error}</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEmbedIndex(1)}
                        className="rounded-full border border-primaryM-500 bg-primaryM-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-primaryM-600"
                      >
                        Try Embed 1
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmbedIndex(2)}
                        className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition hover:border-primaryM-500/50 hover:bg-white/[0.08]"
                      >
                        Try Embed 2
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmbedIndex(3)}
                        className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition hover:border-primaryM-500/50 hover:bg-white/[0.08]"
                      >
                        Try Embed 3
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmbedIndex(4)}
                        className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition hover:border-primaryM-500/50 hover:bg-white/[0.08]"
                      >
                        Try Embed 4
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmbedIndex(5)}
                        className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition hover:border-primaryM-500/50 hover:bg-white/[0.08]"
                      >
                        Try Embed 5
                      </button>
                    </div>
                  </div>
                )}

                {iframeSrc && (
                  <iframe
                    key={iframeSrc}
                    src={iframeSrc}
                    title={`Player - ${title}`}
                    className="h-full w-full border-0 bg-black"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    onLoad={() => {
                      setLoading(false);
                      setError(null);
                    }}
                    onError={handleEmbedError}
                  />
                )}
              </div>

              {/* Controls: embed select centered between two buttons on desktop; stacked on small screens */}
              <div className="mt-3 px-2">
                <div className="grid grid-cols-3 items-center md:grid-cols-1 md:gap-2">
                  <div className="col-start-1 flex items-center gap-2 md:order-2 md:w-full md:justify-center">
                    <button
                      type="button"
                      onClick={() => setLightsOff((v) => !v)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${lightsOff ? "border border-primaryM-500 bg-primaryM-500 text-black" : "border border-white/15 bg-white/[0.04] text-white hover:border-primaryM-500/50 hover:bg-white/[0.08]"}`}
                    >
                      {lightsOff ? "Turn lights on" : "Turn lights off"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheaterMode((v) => !v)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${theaterMode ? "border border-primaryM-500 bg-primaryM-500 text-black" : "border border-white/15 bg-white/[0.04] text-white hover:border-primaryM-500/50 hover:bg-white/[0.08]"}`}
                    >
                      {theaterMode ? "Exit Theater" : "Theater mode"}
                    </button>
                  </div>

                  <div className="col-start-2 flex justify-center md:order-1 md:w-full">
                    {/* placeholder - center column kept for spacing */}
                    <div />
                  </div>

                  <div className="col-start-3 flex justify-end md:order-3 md:w-full md:justify-center md:gap-2">
                    <div className="flex items-center gap-2 md:w-full md:justify-center">
                      <Select
                        value={String(embedIndex)}
                        onValueChange={(value) => setEmbedIndex(Number(value))}
                      >
                        <SelectTrigger className="h-10 min-w-[150px] shrink-0 rounded-full border-white/15 bg-white/[0.04] text-sm text-white shadow-none transition hover:border-primaryM-500 focus:border-primaryM-500 md:w-full md:min-w-0">
                          <SelectValue placeholder="Embed" />
                        </SelectTrigger>
                        <SelectContent className="border-white/10 bg-backgroundM text-white">
                          <SelectItem
                            value="1"
                            className="hover:bg-primaryM-500 hover:text-black"
                          >
                            Embed 1
                          </SelectItem>
                          <SelectItem
                            value="2"
                            className="hover:bg-primaryM-500 hover:text-black"
                          >
                            Embed 2
                          </SelectItem>
                          <SelectItem
                            value="3"
                            className="hover:bg-primaryM-500 hover:text-black"
                          >
                            Embed 3
                          </SelectItem>
                          <SelectItem
                            value="4"
                            className="hover:bg-primaryM-500 hover:text-black"
                          >
                            Embed 4
                          </SelectItem>
                          <SelectItem
                            value="5"
                            className="hover:bg-primaryM-500 hover:text-black"
                          >
                            Embed 5
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
