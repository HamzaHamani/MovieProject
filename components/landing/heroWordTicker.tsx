"use client";

const YOUR_WORD = "Cinema";
const OUR_WORD = "Movies";

export default function HeroWordTicker() {
  return (
    <div className="flex w-full max-w-4xl flex-col items-center text-white">
      <span className="flex w-[85%] items-center justify-between">
        <span className="whitespace-nowrap text-3xl font-medium">your</span>
        <span className="whitespace-nowrap text-[90px] font-extrabold uppercase tracking-tight text-primaryM-400">
          {YOUR_WORD}
        </span>
      </span>

      <span className="flex w-[85%] items-center justify-between">
        <span className="whitespace-nowrap text-[90px] font-extrabold uppercase tracking-tight text-primaryM-400">
          {OUR_WORD}
        </span>
        <span className="whitespace-nowrap text-3xl font-medium">our</span>
      </span>
    </div>
  );
}
