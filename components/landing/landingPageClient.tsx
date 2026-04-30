"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPageClient() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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
        className="relative z-10 mx-auto max-w-4xl text-center"
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
      >
        {/* Badge */}
        <motion.div
          variants={itemVariants}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-primaryM-500/30 bg-primaryM-500/10 px-4 py-2 backdrop-blur-sm xl:mb-7 xl:px-3.5 xl:py-1.5 lg:mb-6 lg:px-3 lg:py-1.5 md:mb-5 md:px-2.5 md:py-1.5 sm:mb-4 sm:px-2 sm:py-1"
        >
          <Sparkles className="h-4 w-4 text-primaryM-400 xl:h-3.5 xl:w-3.5 lg:h-3 lg:w-3 md:h-3 md:w-3 sm:h-2.5 sm:w-2.5" />
          <span className="text-sm font-medium text-primaryM-300 xl:text-xs lg:text-[11px] md:text-[10px] sm:text-[9px]">
            Welcome to the ultimate movie platform
          </span>
        </motion.div>

        {/* Title */}
        <motion.div
          variants={itemVariants}
          className="mb-8 xl:mb-7 lg:mb-6 md:mb-5 sm:mb-4"
        >
          <h1 className="mb-3 text-6xl font-bold leading-tight tracking-tight text-white xl:text-5xl lg:text-4xl md:text-3xl sm:text-[2.15rem] sm:leading-snug">
            Your Cinema,{" "}
            <span className="bg-gradient-to-r from-primaryM-400 to-primaryM-600 bg-clip-text text-transparent">
              Your Community
            </span>
          </h1>
          <p className="mx-auto max-w-[44ch] text-lg font-light text-gray-300 xl:text-base lg:text-sm md:text-xs sm:text-xs">
            Discover thousands of movies and TV shows, build your collections,
            and connect with fellow film enthusiasts
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={itemVariants}
          className="mb-8 grid grid-cols-3 gap-4 border-b border-t border-white/10 py-8 xl:mb-7 xl:gap-3 xl:py-7 lg:mb-6 lg:gap-3 lg:py-6 md:mb-5 md:gap-2.5 md:py-5 sm:mb-4 sm:gap-2 sm:py-4"
        >
          {[
            { label: "Movies & Shows", value: "10,000+" },
            { label: "Global Community", value: "50K+" },
            { label: "Reviews & Ratings", value: "100K+" },
          ].map((stat, index) => (
            <div key={index}>
              <p className="text-3xl font-bold text-primaryM-400 xl:text-2xl lg:text-xl md:text-lg smd:text-sm sm:text-lg">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-gray-400 xl:text-xs lg:text-[11px] md:text-[10px] sm:text-[10px]">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="mb-8 flex flex-row items-center justify-center gap-4 xl:mb-7 xl:gap-3 lg:mb-6 lg:gap-3 md:mb-5 md:gap-2 sm:mb-4 sm:gap-2"
        >
          <Link href="/explore">
            <button className="group relative inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primaryM-500 via-primaryM-600 to-primaryM-700 px-8 py-4 text-base font-bold text-black transition-all duration-200 hover:shadow-md active:scale-95 xl:px-7 xl:py-3.5 xl:text-sm lg:px-6 lg:py-3 lg:text-sm md:px-5 md:py-2.5 md:text-[13px] sm:px-4 sm:py-2 sm:text-sm">
              <Play className="h-5 w-5 transition xl:h-4 xl:w-4 lg:h-4 lg:w-4 md:h-4 md:w-4 sm:h-3.5 sm:w-3.5" />
              Start Exploring
              <ArrowRight className="h-5 w-5 transition xl:h-4 xl:w-4 lg:h-4 lg:w-4 md:h-4 md:w-4 sm:h-3.5 sm:w-3.5" />
            </button>
          </Link>

          <Link href="/sign-in">
            <button className="rounded-lg border border-primaryM-500/50 bg-primaryM-500/5 px-8 py-4 text-base font-bold text-primaryM-300 backdrop-blur-sm transition-all duration-300 hover:border-primaryM-500 hover:bg-primaryM-500/15 xl:px-7 xl:py-3.5 xl:text-sm lg:px-6 lg:py-3 lg:text-sm md:px-5 md:py-2.5 md:text-[13px] sm:px-4 sm:py-2 sm:text-sm">
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
