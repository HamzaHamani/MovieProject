"use client";

import Link from "next/link";
import gsap from "gsap";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LazyBlurImage from "@/components/ui/lazyBlurImage";
import type { SearchResult, TsearchApiResponse } from "@/types/api";

import MovieTvCard from "../general/movieTvCard";
import { Eye, EyeOff } from "lucide-react";

type Props = {
  data: TsearchApiResponse;
  showNSFW?: boolean;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function BlurredAdultCard({
  result,
  onReveal,
}: {
  result: SearchResult;
  onReveal: () => void;
}) {
  const [revealed, setRevealed] = useState(false);

  const handleReveal = () => {
    setRevealed(true);
    onReveal();
  };

  return (
    <div className="w-full">
      {!revealed ? (
        <div className="group relative w-full max-w-[340px] self-center xl:max-w-[310px] lg:max-w-[280px] h1text8:max-w-[250px] smd:max-w-[220px] sss:max-w-[200px] s:max-w-[210px]">
          <div className="relative h-[550px] overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition xl:h-[430px] lg:h-[390px] h1text8:h-[400px] xsmd:h-[450px] smd:h-[350px] sss:h-[330px] s:h-[370px]">
            {result.imagePath ? (
              <LazyBlurImage
                src={`https://image.tmdb.org/t/p/w500${result.imagePath}`}
                alt={result.title}
                className="h-full w-full object-cover blur-2xl"
                placeholderClassName="bg-zinc-800/70"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-white/5 to-black/20 blur-2xl">
                No image
              </div>
            )}

            <div className="absolute inset-0 bg-black/60" />

            <button
              onClick={handleReveal}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            >
              <Eye className="h-8 w-8 text-white" />
              <span className="text-sm font-semibold text-white">
                Show Content
              </span>
            </button>
          </div>
          <div className="mt-2">
            <p className="line-clamp-2 text-xs font-semibold text-gray-300">
              {result.title}
            </p>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-gray-400">{result.mediaLabel}</span>
              <span className="text-xs font-semibold text-red-400">NSFW</span>
            </div>
          </div>
        </div>
      ) : (
        <MovieTvCard
          href={result.href}
          posterPath={result.imagePath}
          title={result.title}
          voteAverage={result.voteAverage}
          mediaTypeLabel={result.mediaLabel as "Film" | "TV Show" | "TV"}
          year={result.year || "----"}
          className="w-full max-w-[340px] self-center xl:max-w-[310px] lg:max-w-[280px] h1text8:max-w-[250px] smd:max-w-[220px] sss:max-w-[200px] s:max-w-[210px]"
          imageClassName="h-[550px] xl:h-[430px] lg:h-[390px] h1text8:h-[400px] xsmd:h-[450px] smd:h-[350px] sss:h-[330px] s:h-[370px]"
        />
      )}
    </div>
  );
}

function PersonCard({ result }: { result: SearchResult }) {
  return (
    <Link
      href={result.href}
      className="group block w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition hover:border-primaryM-500/50 hover:bg-white/[0.05]"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-black/40">
        {result.imagePath ? (
          <LazyBlurImage
            src={`https://image.tmdb.org/t/p/w500${result.imagePath}`}
            alt={result.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            placeholderClassName="bg-zinc-800/70"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-white/5 to-black/20 text-xs text-gray-400">
            No image
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-3">
          <h3 className="line-clamp-1 text-base font-semibold text-white">
            {result.title}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs text-gray-300">
            {result.subtitle}
          </p>
        </div>
      </div>
    </Link>
  );
}

function UserCard({ result }: { result: SearchResult }) {
  return (
    <Link
      href={result.href}
      className="group block w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition hover:border-primaryM-500/50 hover:bg-white/[0.05]"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-black/40">
        {result.imagePath ? (
          <LazyBlurImage
            src={result.imagePath}
            alt={result.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            placeholderClassName="bg-zinc-800/70"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-white/[0.03] text-sm text-gray-500">
            <Avatar className="h-20 w-20 border border-white/15 bg-white/10">
              <AvatarFallback className="bg-white/10 text-xl text-white">
                {getInitials(result.title)}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-3">
          <h3 className="line-clamp-1 text-base font-semibold text-white">
            {result.title}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs text-gray-300">
            {result.username ? `@${result.username}` : result.subtitle}
          </p>
          <p className="mt-1 line-clamp-2 text-xs text-gray-300/95">
            {result.bio || "No bio yet."}
          </p>
          <p className="mt-1 text-[11px] font-medium text-primaryM-300">
            Community profile
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function SearchMoviesDisplay({ data, showNSFW = false }: Props) {
  const [displayedResults, setDisplayedResults] = useState<SearchResult[]>(
    data.results,
  );
  const [revealedAdultCards, setRevealedAdultCards] = useState<Set<string>>(
    new Set(),
  );
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const mountedRef = useRef(false);
  const transitionRef = useRef<gsap.core.Timeline | null>(null);
  const animatingRef = useRef(false);

  // Filter results based on NSFW setting
  const filteredResults = showNSFW
    ? data.results
    : data.results.filter((result) => {
        // Keep non-media results (users, persons)
        if (result.kind === "user" || result.kind === "person") return true;
        // Filter out adult media when NSFW is off
        return !(result as any).adult;
      });

  const resultSignature = filteredResults
    .map((result) => `${result.kind}-${result.id}`)
    .join("|");

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    const newSignature = filteredResults
      .map((result) => `${result.kind}-${result.id}`)
      .join("|");
    const oldSignature = displayedResults
      .map((result) => `${result.kind}-${result.id}`)
      .join("|");

    if (newSignature === oldSignature) {
      return;
    }

    transitionRef.current?.kill();
    const outgoingCards = cardRefs.current.filter(
      (node): node is HTMLDivElement => Boolean(node),
    );

    if (outgoingCards.length === 0) {
      setDisplayedResults(filteredResults);
      return;
    }

    animatingRef.current = true;
    transitionRef.current = gsap.timeline({
      onComplete: () => {
        setDisplayedResults(filteredResults);
      },
    });

    transitionRef.current.to(outgoingCards, {
      autoAlpha: 0,
      y: 18,
      scale: 0.98,
      duration: 0.5,
      stagger: 0.015,
      ease: "power2.inOut",
    });

    return () => {
      transitionRef.current?.kill();
    };
  }, [resultSignature, filteredResults, displayedResults, showNSFW]);

  useLayoutEffect(() => {
    if (!animatingRef.current) return;

    const incomingCards = cardRefs.current.filter(
      (node): node is HTMLDivElement => Boolean(node),
    );

    if (incomingCards.length === 0) {
      animatingRef.current = false;
      return;
    }

    const intro = gsap.fromTo(
      incomingCards,
      { autoAlpha: 0, y: 18, scale: 0.98 },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.04,
        ease: "power3.out",
        onComplete: () => {
          animatingRef.current = false;
        },
      },
    );

    return () => {
      intro.kill();
    };
  }, [displayedResults]);

  const handleRevealAdult = (id: string) => {
    setRevealedAdultCards((prev) => new Set([...prev, id]));
  };

  return (
    <div className="relative mt-10 grid w-full grid-cols-5 items-start justify-items-center gap-5 xxl:grid-cols-4 ds:grid-cols-3 lg:grid-cols-3 xssmd:grid-cols-2 smd:grid-cols-2 s:grid-cols-1">
      {displayedResults.map((result, index) => {
        if (result.kind === "user") {
          return (
            <div
              key={result.id}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className="w-full"
            >
              <UserCard result={result} />
            </div>
          );
        }

        if (result.kind === "person") {
          return (
            <div
              key={result.id}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className="w-full"
            >
              <PersonCard result={result} />
            </div>
          );
        }

        const isAdult = (result as any).adult && !showNSFW;
        const cardId = `${result.kind}-${result.id}`;
        const isRevealed = revealedAdultCards.has(cardId);

        return (
          <div
            key={result.id}
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
            className="w-full"
          >
            {isAdult && !isRevealed ? (
              <BlurredAdultCard
                result={result}
                onReveal={() => handleRevealAdult(cardId)}
              />
            ) : (
              <MovieTvCard
                href={result.href}
                posterPath={result.imagePath}
                title={result.title}
                voteAverage={result.voteAverage}
                mediaTypeLabel={result.mediaLabel as "Film" | "TV Show" | "TV"}
                year={result.year || "----"}
                className="w-full max-w-[340px] self-center xl:max-w-[310px] lg:max-w-[280px] h1text8:max-w-[250px] smd:max-w-[220px] sss:max-w-[200px] s:max-w-[210px]"
                imageClassName="h-[550px] xl:h-[430px] lg:h-[390px] h1text8:h-[400px] xsmd:h-[450px] smd:h-[350px] sss:h-[330px] s:h-[370px]"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
