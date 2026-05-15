"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Props = {
  links: { href: string; label: string }[];
};

export default function NavbarList({ links }: Props) {
  const pathname = usePathname();
  const [activeIndicator, setActiveIndicator] = useState({
    left: 0,
    width: 0,
  });
  const containerRef = useRef<HTMLUListElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const updateIndicator = () => {
    const activeLink = links.find((link) => isActive(link.href));
    if (!activeLink || !linkRefs.current[activeLink.href]) {
      setActiveIndicator({ left: 0, width: 0 });
      return;
    }

    const element = linkRefs.current[activeLink.href];
    if (!element || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    setActiveIndicator({
      left: elementRect.left - containerRect.left,
      width: elementRect.width,
    });
  };

  useEffect(() => {
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [pathname, links]);

  return (
    <ul
      ref={containerRef}
      className="relative flex items-center gap-7 font-light md:hidden"
    >
      {/* Animated underline */}
      <div
        className="absolute bottom-0 h-0.5 bg-primaryM-500 transition-all duration-300 ease-out"
        style={{
          left: `${activeIndicator.left}px`,
          width: `${activeIndicator.width}px`,
        }}
      />

      {links.map((elm) => (
        <Link
          ref={(el) => {
            if (el) linkRefs.current[elm.href] = el;
          }}
          href={elm.href}
          key={elm.href}
          className={`relative cursor-pointer pb-1 font-medium transition-colors ${
            isActive(elm.href)
              ? "text-white"
              : "text-gray-200 hover:text-gray-100"
          }`}
        >
          {elm.label}
        </Link>
      ))}
    </ul>
  );
}
