"use client";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";

import { getUser } from "@/lib/actions";
import { CirclePlus } from "lucide-react";
import { TspecifiedMovie } from "@/types/api";
import { TspecifiedTv } from "@/types/apiTv";
import ModeleLog from "../ModeleLog";

// Star rating component
const StarRating = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className="text-2xl text-yellow-400 transition-transform hover:scale-110"
        onClick={() => onChange(star)}
        aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
      >
        {value >= star ? "★" : "☆"}
      </button>
    ))}
  </div>
);

type Props = {
  show: TspecifiedMovie | TspecifiedTv; // Adjust the type according to your needs
  typeM?: "movie" | "tv";
};

export default function LogTheMT({ show, typeM }: Props) {
  const [showCard, setShowCard] = useState(false);

  async function handleClick(e: any) {
    const user = await getUser();
    const id: string = user?.id as string;
    console.log(show.id);
  }

  return (
    <form action={handleClick}>
      <Button
        className="flex items-center gap-2 bg-primaryM-500 text-black hover:bg-primaryM-600 xsmd:text-xs"
        type="submit"
        onClick={() => setShowCard(true)}
      >
        {" "}
        <span className="xsmd:text-xs">
          <CirclePlus />
        </span>
        Log The {typeM === "movie" ? "Movie" : "Tv Show"}
      </Button>

      {showCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backdropFilter: "blur(8px)",
            background: "rgba(0,0,0,0.3)",
          }}
        >
          <div className="relative mx-auto w-full max-w-md">
            <button
              className="absolute right-4 top-4 text-2xl text-gray-400 hover:text-white"
              onClick={() => setShowCard(false)}
              aria-label="Close"
            >
              ×
            </button>
            <ModeleLog typeM={typeM} show={show} setShowCard={setShowCard} />
          </div>
        </div>
      )}
    </form>
  );
}
