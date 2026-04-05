"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import useInViewport from "@/hooks/useInViewport";

export default function AutoLoadMoreLink({
  href,
  enabled,
}: {
  href: string;
  enabled: boolean;
}) {
  const { ref, isInView } = useInViewport<HTMLDivElement>("260px");
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(false);
  }, [href]);

  useEffect(() => {
    if (!enabled || !isInView || isNavigating) {
      return;
    }

    setIsNavigating(true);
    router.replace(href, { scroll: false });
  }, [enabled, href, isInView, isNavigating, router]);

  return <div ref={ref} className="h-px w-full" />;
}
