"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  left: React.ReactNode;
  right: React.ReactNode;
  mobile: React.ReactNode;
};

export default function TransparentNavbarShell({ left, right, mobile }: Props) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 12) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      if (currentScrollY > lastScrollY.current) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    lastScrollY.current = window.scrollY;
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 mx-auto flex w-full items-center justify-between bg-transparent p-4 px-16 text-textMain transition-transform duration-300 ease-out xmd:p-3 xmd:px-10 xmd:text-sm ${
        isVisible
          ? "pointer-events-auto translate-y-0"
          : "pointer-events-none -translate-y-full"
      }`}
      style={{ backgroundColor: "transparent" }}
    >
      <div className="flex items-center gap-8">{left}</div>
      {right}
      {mobile}
    </nav>
  );
}
