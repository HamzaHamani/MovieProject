"use client";

import React, { useEffect, useState } from "react";

export default function InternalTopProgress() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer: any = null;

    function onStart() {
      setVisible(true);
      setProgress(10);
      timer = setInterval(() => {
        setProgress((p) => Math.min(95, p + Math.random() * 10));
      }, 300);
    }

    function onStop() {
      setProgress(100);
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    window.addEventListener("internal-loading-start", onStart as EventListener);
    window.addEventListener("internal-loading-stop", onStop as EventListener);

    return () => {
      window.removeEventListener(
        "internal-loading-start",
        onStart as EventListener,
      );
      window.removeEventListener(
        "internal-loading-stop",
        onStop as EventListener,
      );
      if (timer) clearInterval(timer);
    };
  }, []);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed left-0 top-0 z-[9999] h-1 w-full transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="h-1 bg-primaryM-500 transition-all duration-200"
        style={{
          width: `${progress}%`,
          boxShadow: "0 0 12px rgba(234,179,8,0.6)",
        }}
      />
    </div>
  );
}
