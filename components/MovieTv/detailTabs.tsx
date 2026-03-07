"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useRef, useState } from "react";

type TabItem = {
  key: string;
  label: string;
};

type Props = {
  items: TabItem[];
  active?: string;
  typeM: "movie" | "tv";
  id: number;
};

export default function DetailTabs({ items, active, typeM, id }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0, visible: false });

  useEffect(() => {
    const updateIndicator = () => {
      if (!active) {
        setIndicator((prev) => ({ ...prev, visible: false }));
        return;
      }

      const containerEl = containerRef.current;
      const activeTabEl = tabRefs.current[active];

      if (!containerEl || !activeTabEl) {
        setIndicator((prev) => ({ ...prev, visible: false }));
        return;
      }

      const containerRect = containerEl.getBoundingClientRect();
      const activeRect = activeTabEl.getBoundingClientRect();

      setIndicator({
        left: activeRect.left - containerRect.left,
        width: activeRect.width,
        visible: true,
      });
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [active, items]);

  const onSelectTab = (tabKey: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabKey);

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="mb-6 mt-1 border-b border-white/10">
      <div
        ref={containerRef}
        className="relative flex flex-wrap items-center gap-6 pb-3 text-sm text-gray-400"
      >
        {items.map((item) => {
          const isActive = active === item.key;
          return (
            <button
              type="button"
              key={item.key}
              onClick={() => onSelectTab(item.key)}
              ref={(el) => {
                tabRefs.current[item.key] = el;
              }}
              className={`relative pb-1 transition ${
                isActive ? "text-white" : "hover:text-gray-200"
              }`}
            >
              {item.label}
            </button>
          );
        })}

        <span
          className={`pointer-events-none absolute -bottom-[1px] h-[2px] bg-primaryM-500 transition-[left,width,opacity] duration-300 ease-out ${
            indicator.visible ? "opacity-100" : "opacity-0"
          }`}
          style={{
            left: indicator.left,
            width: indicator.width,
          }}
        />
      </div>
    </div>
  );
}
