"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface TrendingMovie {
  id: number;
  backdrop_path: string | null;
  title?: string;
  name?: string;
  media_type: "movie" | "tv";
}

export default function LandingBackdropCarouselClient({
  movies,
}: {
  movies: TrendingMovie[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === movies.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [autoplay, movies.length]);

  useEffect(() => {
    const timer = setTimeout(() => setAutoplay(true), 8000);
    return () => clearTimeout(timer);
  }, [autoplay]);

  if (!movies.length) return null;

  const currentMovie = movies[currentIndex];

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Carousel */}
      <div className="relative h-full w-full min-h-screen">
        {currentMovie?.backdrop_path && (
          <>
            <motion.div
              key={currentMovie.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <Image
                src={`https://image.tmdb.org/t/p/original${currentMovie.backdrop_path}`}
                alt={currentMovie.title || currentMovie.name || "Movie backdrop"}
                fill
                className="object-cover"
                priority
                quality={85}
              />
            </motion.div>

            {/* Multiple overlays for unique design */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/60" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-backgroundM" />
            
            {/* Accent lines */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primaryM-500 to-transparent opacity-40" />
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primaryM-500 to-transparent opacity-40" />
            </div>
          </>
        )}

        {/* Carousel Indicators */}
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2 smd:bottom-4 smd:gap-1.5">
          {movies.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setAutoplay(false);
              }}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-8 bg-primaryM-500"
                  : "w-2 bg-white/40 hover:bg-white/60"
              }`}
              whileHover={{ scale: 1.2 }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Info Box */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute bottom-6 left-6 z-10 max-w-md rounded-lg border border-primaryM-500/20 bg-black/30 p-4 backdrop-blur-sm xmd:left-4 xmd:max-w-xs xmd:p-3 smd:bottom-4 smd:left-3 smd:max-w-[220px] smd:p-2"
        >
          <h3 className="line-clamp-1 text-base font-medium tracking-tight text-white font-sans xmd:text-base smd:text-sm">
            {currentMovie.title || currentMovie.name}
          </h3>
        </motion.div>
      </div>
    </div>
  );
}
