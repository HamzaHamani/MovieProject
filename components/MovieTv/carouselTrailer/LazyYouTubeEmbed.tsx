// LazyYouTubeEmbed.tsx
"use client";
import React, { useState } from "react";

interface LazyYouTubeEmbedProps {
  videoId: string;
}

const LazyYouTubeEmbed: React.FC<LazyYouTubeEmbedProps> = ({ videoId }) => {
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div className="relative aspect-[268/151] w-full max-w-[268px] overflow-hidden rounded-lg bg-black">
      {!isIframeLoaded ? (
        <div
          className="h-full w-full cursor-pointer bg-cover bg-center"
          style={{ backgroundImage: `url(${thumbnail})` }}
          onClick={() => setIsIframeLoaded(true)}
        >
          <button
            className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-none bg-black/60 text-3xl text-white"
            aria-label="Play Video"
          >
            ▶
          </button>
        </div>
      ) : (
        <iframe
          className="absolute left-0 top-0 h-full w-full rounded-lg"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="YouTube video"
        />
      )}
    </div>
  );
};

export default LazyYouTubeEmbed;
