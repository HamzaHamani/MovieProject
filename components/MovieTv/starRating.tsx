"use client";
import React, { useState } from "react";

type Props = {};

export default function StarRating({}: Props) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);

  function handlingStar(newRating: number) {
    setRating(newRating);
    // Instead of API call, just log the review star selection
    console.log("Review star selection:", newRating);
  }

  return (
    <div className="mt-1 flex gap-2" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const value = hovered || rating;
        const isFull = value >= star;
        const isHalf = value + 0.5 === star;

        // SVG path for sharp Letterboxd-like star
        const starPath =
          "M12 2.25l3.09 6.26 6.91 1-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.38l-5-4.87 6.91-1L12 2.25z";

        // Colors
        const activeFill = "var(--bg-primaryM-100, #ffb700)";
        const inactiveColor = "#232323";

        return (
          <button
            key={star}
            type="button"
            className="b relative p-1"
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            style={{ lineHeight: 0 }}
            onMouseMove={(e) => {
              const { left, width } = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - left;
              if (x < width / 2) {
                setHovered(star - 0.5);
              } else {
                setHovered(star);
              }
            }}
            onClick={(e) => {
              const { left, width } = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - left;
              let newRating = 0;
              if (
                (x < width / 2 && rating === star - 0.5) ||
                (x >= width / 2 && rating === star)
              ) {
                newRating = 0;
              } else {
                newRating = x < width / 2 ? star - 0.5 : star;
              }
              handlingStar(newRating);
            }}
          >
            <svg
              width={40}
              height={40}
              viewBox="0 0 24 24"
              fill="none"
              stroke={isFull || isHalf ? activeFill : inactiveColor}
              strokeWidth={isFull || isHalf ? 1.5 : 1}
              className={`transition-all`}
            >
              <defs>
                <linearGradient id={`half-gradient-${star}`}>
                  <stop
                    offset="50%"
                    stopColor={isFull || isHalf ? activeFill : inactiveColor}
                  />
                  <stop offset="50%" stopColor={inactiveColor} />
                </linearGradient>
              </defs>
              {isFull ? (
                <path d={starPath} fill={activeFill} />
              ) : isHalf ? (
                <path d={starPath} fill={`url(#half-gradient-${star})`} />
              ) : (
                <path d={starPath} fill={inactiveColor} />
              )}
            </svg>
          </button>
        );
      })}
    </div>
  );
}
