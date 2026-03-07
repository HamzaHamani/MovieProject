"use client";

import { useEffect, useRef, useState } from "react";

export default function useNearViewport<T extends HTMLElement>(
  rootMargin = "350px",
) {
  const ref = useRef<T | null>(null);
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    if (isNear) {
      return;
    }

    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNear(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [isNear, rootMargin]);

  return { ref, isNear };
}
