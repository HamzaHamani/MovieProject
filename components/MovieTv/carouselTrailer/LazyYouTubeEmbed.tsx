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
    <div className="relative aspect-[16/9] w-[330px] max-w-[45vw] flex-shrink-0 overflow-hidden rounded-lg s:w-[380px] s:max-w-[95vw]">
      {!isIframeLoaded ? (
        <div
          className="h-full w-full cursor-pointer bg-cover bg-center"
          style={{ backgroundImage: `url(${thumbnail})` }}
          onClick={() => setIsIframeLoaded(true)}
        >
          <button
            style={{
              position: "absolute",
              zIndex: 2,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: 32,
              background: "rgba(0,0,0,0.6)",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: 64,
              height: 64,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Play Video"
            type="button"
            onClick={() => setIsIframeLoaded(true)}
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
