"use client";

const YOUR_WORD = "Cinema";
const OUR_WORD = "Movies";

export default function HeroWordTicker() {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-0 text-white">
      {/* Your Label */}
      <span className="text-base font-medium text-gray-400 xl:text-sm lg:text-xs md:text-xs sm:text-[11px]">
        your
      </span>

      {/* Cinema */}
      <span className="whitespace-nowrap text-[90px] font-extrabold uppercase tracking-tight text-primaryM-400 xl:text-[75px] lg:text-[60px] md:text-[48px] sm:text-[48px]">
        {YOUR_WORD}
      </span>

      {/* Movies */}
      <span className="whitespace-nowrap text-[90px] font-extrabold uppercase tracking-tight text-primaryM-400 xl:text-[75px] lg:text-[60px] md:text-[48px] sm:text-[48px]">
        {OUR_WORD}
      </span>

      {/* Our Label */}
      <span className="text-base font-medium text-gray-400 xl:text-sm lg:text-xs md:text-xs sm:text-[11px]">
        our
      </span>
    </div>
  );
}
