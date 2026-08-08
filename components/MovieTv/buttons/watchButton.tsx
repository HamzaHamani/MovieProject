"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X, LogIn, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

type Props = {
  href: string;
  isLoggedIn: boolean;
  variant: "movie" | "tv";
};

// ── Custom portal modal — fade + blur backdrop (same as DrawerDialogButtonList) ──
function CustomModal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setVisible(true)),
      );
      document.body.style.overflow = "hidden";
    } else {
      setVisible(false);
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!visible && mounted && !open) {
      const t = setTimeout(() => setMounted(false), 220);
      return () => clearTimeout(t);
    }
  }, [visible, mounted, open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: visible ? "rgba(0,0,0,0.70)" : "rgba(0,0,0,0)",
        backdropFilter: visible ? "blur(4px)" : "blur(0px)",
        WebkitBackdropFilter: visible ? "blur(4px)" : "blur(0px)",
        transition: "background 0.2s ease, backdrop-filter 0.2s ease",
      }}
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className="relative max-h-[88svh] w-full max-w-[500px] overflow-y-auto rounded-2xl border border-white/10 bg-[#1a1a1a]"
        style={{
          scrollbarWidth: "none",
          opacity: visible ? 1 : 0,
          transform: visible
            ? "scale(1) translateY(0)"
            : "scale(0.96) translateY(8px)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
        }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}

// ── Shared footer (same as DrawerDialogButtonList) ────────────────────────────
function Footer({
  onClose,
  primaryLabel,
  primaryHref,
}: {
  onClose?: () => void;
  primaryLabel: React.ReactNode;
  primaryHref: string;
}) {
  return (
    <div className="sticky bottom-0 z-10 flex gap-2.5 border-t border-white/10 py-4">
      <button
        type="button"
        onClick={onClose}
        className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] py-3 text-sm font-medium text-white/50 transition hover:bg-white/[0.08] hover:text-white/70"
      >
        Cancel
      </button>
      <Link
        href={primaryHref}
        className="flex flex-[2] items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-black transition hover:opacity-90"
        style={{ background: "#c9a227" }}
      >
        {primaryLabel}
      </Link>
    </div>
  );
}

// ── Login-required content (matches DrawerDialogButtonList's not-logged-in state) ──
function LoginRequiredContent({
  onClose,
  className,
}: {
  onClose?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-5 bg-[#0D0C0F] p-6", className)}>
      <div className="flex flex-col items-center gap-6 rounded-xl border border-white/10 bg-[#141316] px-6 py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
          <LogIn className="h-7 w-7 text-amber-400" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-medium text-white">Login required</h3>
          <p className="text-sm text-white/45">
            You need to be signed in to watch this content.
          </p>
        </div>
      </div>
      <Footer
        onClose={onClose}
        primaryHref="/sign-in"
        primaryLabel={
          <>
            <LogIn className="h-4 w-4" />
            Go to sign in
          </>
        }
      />
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export default function WatchButton({ href, isLoggedIn, variant }: Props) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const className =
    variant === "movie"
      ? "rounded-full border border-primaryM-500 bg-primaryM-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-primaryM-600"
      : "rounded-lg border border-primaryM-500 bg-primaryM-500 px-4 py-2 text-sm text-black transition hover:bg-primaryM-600";

  const label = variant === "movie" ? "Watch it" : <Play className="h-4 w-4" />;

  if (isLoggedIn) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }

  if (isDesktop) {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={className}
        >
          {label}
        </button>
        <CustomModal open={open} onClose={() => setOpen(false)}>
          <LoginRequiredContent onClose={() => setOpen(false)} />
        </CustomModal>
      </>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {label}
      </button>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-h-[88svh] w-full overflow-hidden rounded-t-2xl border-t border-white/10 bg-[#0D0C0F] px-0 pt-0">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Login required</DrawerTitle>
            <DrawerDescription>
              You need to be signed in to watch this content.
            </DrawerDescription>
          </DrawerHeader>
          <div className="min-h-0 overflow-y-auto overscroll-contain pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <LoginRequiredContent onClose={() => setOpen(false)} />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
