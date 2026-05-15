"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";
import HeroWordTicker from "./heroWordTicker";

interface MousePos {
  x: number;
  y: number;
}

export default function LandingPageClient() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePos, setMousePos] = useState<MousePos>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState<string | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = (buttonId: string) => {
    setIsHovering(buttonId);
  };

  const handleMouseLeave = () => {
    setIsHovering(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <div className="relative flex h-full min-h-0 w-full items-center justify-center px-8 py-16 xl:px-6 xl:py-14 lg:px-4 lg:py-12 md:px-3 md:py-10 sm:px-2 sm:py-8">
      {/* Content Container - Centered on Backdrop */}
      <motion.div
        className="relative z-10 mx-auto max-w-6xl text-center xl:max-w-5xl lg:max-w-4xl md:max-w-3xl"
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
      >
        {/* Title */}
        <motion.div
          variants={itemVariants}
          className="mb-8 xl:mb-7 lg:mb-6 md:mb-5 sm:mb-4"
        >
          <h1 className="mb-4 text-6xl font-bold leading-tight tracking-tight text-white xl:text-5xl lg:text-4xl md:text-3xl sm:text-[2.15rem] sm:leading-snug">
            <HeroWordTicker />
          </h1>
          <p className="mx-auto max-w-[44ch] text-lg font-light text-gray-300 xl:text-base lg:text-sm md:text-xs sm:text-xs">
            Discover movies and TV shows, build your watchlist, and connect with
            fellow fans through reviews and collections.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="mb-8 flex flex-row items-center justify-center gap-4 xl:mb-7 xl:gap-3 lg:mb-6 lg:gap-3 md:mb-5 md:gap-2 sm:mb-4 sm:gap-2"
        >
          <Link href="/explore">
            <button
              className="group relative inline-flex transform items-center gap-2 rounded-lg bg-gradient-to-r from-primaryM-500 via-primaryM-600 to-primaryM-700 px-8 py-4 text-base font-bold text-black transition duration-500 ease-out hover:-rotate-2 hover:scale-110 hover:shadow-xl active:scale-95 xl:px-7 xl:py-3.5 xl:text-sm lg:px-6 lg:py-3 lg:text-sm md:px-5 md:py-2.5 md:text-[13px] sm:px-4 sm:py-2 sm:text-sm"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => handleMouseEnter("explore")}
              onMouseLeave={handleMouseLeave}
            >
              {/* Glow effect */}
              {isHovering === "explore" && (
                <div
                  className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle 100px at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.3) 0%, transparent 80%)`,
                  }}
                />
              )}
              <Play className="relative h-5 w-5 transition xl:h-4 xl:w-4 lg:h-4 lg:w-4 md:h-4 md:w-4 sm:h-3.5 sm:w-3.5" />
              Start Exploring
              <ArrowRight className="relative h-5 w-5 transition xl:h-4 xl:w-4 lg:h-4 lg:w-4 md:h-4 md:w-4 sm:h-3.5 sm:w-3.5" />
            </button>
          </Link>

          <Link href="/sign-in">
            <button
              className="group relative transform rounded-lg border border-primaryM-500/50 bg-primaryM-500/5 px-8 py-4 text-base font-bold text-primaryM-300 backdrop-blur-sm transition duration-500 ease-out hover:-rotate-2 hover:scale-110 hover:border-primaryM-500 hover:bg-primaryM-500/15 hover:shadow-xl xl:px-7 xl:py-3.5 xl:text-sm lg:px-6 lg:py-3 lg:text-sm md:px-5 md:py-2.5 md:text-[13px] sm:px-4 sm:py-2 sm:text-sm"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => handleMouseEnter("signin")}
              onMouseLeave={handleMouseLeave}
            >
              {/* Glow effect */}
              {isHovering === "signin" && (
                <div
                  className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle 100px at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.2) 0%, transparent 80%)`,
                  }}
                />
              )}
              Sign In to Your Account
            </button>
          </Link>
        </motion.div>

        {/* Bottom CTA Text */}
        <motion.p
          variants={itemVariants}
          className="mt-8 text-sm text-gray-400 xl:mt-7 xl:text-xs lg:mt-6 lg:text-[11px] md:mt-5 md:text-[10px] sm:mt-4 sm:text-[10px]"
        >
          Join thousands of cinephiles sharing their passion for great cinema.
          <span className="mt-2 block text-xs text-gray-500 xl:mt-1.5 xl:text-[10px] lg:text-[9px] md:text-[8px] sm:text-[8px]">
            No credit card required • Free forever
          </span>
        </motion.p>
      </motion.div>
    </div>
  );
}
