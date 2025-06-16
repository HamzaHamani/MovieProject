import { Bookmark, Heart, Share2, Star } from "lucide-react";
import React, { useState } from "react";
import { Separator } from "../ui/separator";
import StarRating from "./starRating";
import { ButtonAnimation } from "../ui/ButtonAnimation";

type Props = {};

export default function BWCard({}: Props) {
  return (
    <div className="flex w-[340px] flex-col self-end overflow-hidden rounded-lg border border-gray-700 bg-gray-400">
      <button className="w-full border-t border-t-backgroundM bg-gray-400 p-4">
        Log The Movie
      </button>
      <button className="w-full border-t border-t-backgroundM bg-gray-400 p-4">
        Add To a list
      </button>
      <button className="w-full border-t border-t-backgroundM bg-gray-400 p-4">
        Share
      </button>
    </div>
  );
}
