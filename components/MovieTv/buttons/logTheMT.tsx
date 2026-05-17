"use client";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { CirclePlus, Pencil, Trash2, X } from "lucide-react";
import { TspecifiedMovie } from "@/types/api";
import { TspecifiedTv } from "@/types/apiTv";
import ModeleLog from "../ModeleLog";
import {
  getLoggedMovieTv,
  type TExistingLog,
  deleteLoggedMovieTv,
} from "@/lib/actions";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

type Props = {
  show: TspecifiedMovie | TspecifiedTv;
  typeM?: "movie" | "tv";
  userId?: string;
  initialLog?: TExistingLog | null;
  buttonLabel?: string;
  iconOnly?: boolean;
  useEditIcon?: boolean;
  triggerClassName?: string;
};

// ─── Animated portal modal ────────────────────────────────────────────────────

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

  // Mount first, then trigger visible on next frame so CSS transition fires
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

  // Unmount after exit transition completes
  useEffect(() => {
    if (!visible && mounted && !open) {
      const t = setTimeout(() => setMounted(false), 220);
      return () => clearTimeout(t);
    }
  }, [visible, mounted, open]);

  // Escape key
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
        background: visible ? "rgba(0,0,0,0.72)" : "rgba(0,0,0,0)",
        backdropFilter: visible ? "blur(10px)" : "blur(0px)",
        WebkitBackdropFilter: visible ? "blur(10px)" : "blur(0px)",
        transition: "background 0.22s ease, backdrop-filter 0.22s ease",
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
            : "scale(0.96) translateY(10px)",
          transition: "opacity 0.22s ease, transform 0.22s ease",
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

// ─── Main component ───────────────────────────────────────────────────────────

export default function LogTheMT({
  show,
  typeM,
  userId,
  initialLog,
  buttonLabel,
  iconOnly = false,
  useEditIcon = false,
  triggerClassName,
}: Props) {
  const [showCard, setShowCard] = useState(false);
  const [currentLog, setCurrentLog] = useState<TExistingLog | null>(
    initialLog ?? null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    if (!showCard || !userId) return;
    if (initialLog) {
      setCurrentLog(initialLog);
      return;
    }
    (async () => {
      const freshLog = await getLoggedMovieTv(show.id, typeM);
      setCurrentLog(freshLog);
    })();
  }, [showCard, userId, show.id]);

  const handleDelete = async () => {
    if (!currentLog?.id) return;
    setIsDeleting(true);
    try {
      await deleteLoggedMovieTv(currentLog.id);
      setCurrentLog(null);
      setShowCard(false);
    } catch (error) {
      console.error("Failed to delete log:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const loginRequiredContent = (
    <div className="flex flex-col items-center gap-6 px-6 py-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
        <LogIn className="h-7 w-7 text-amber-400" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-lg font-medium text-white">Login required</h3>
        <p className="text-sm text-white/45">
          You need to be signed in to log this{" "}
          {typeM === "movie" ? "movie" : "TV show"}.
        </p>
      </div>
      <div className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <Button
          asChild
          className="w-full bg-amber-500 font-medium text-black hover:bg-amber-400"
        >
          <Link href="/sign-in">
            <LogIn className="mr-2 h-4 w-4" />
            Go to sign in
          </Link>
        </Button>
      </div>
    </div>
  );

  const content = !userId ? (
    loginRequiredContent
  ) : (
    <ModeleLog
      key={currentLog?.id ?? show.id}
      typeM={typeM}
      show={show}
      setShowCard={setShowCard}
      initialLog={currentLog}
      onSaved={(savedLog) =>
        setCurrentLog((previous) => ({
          id: previous?.id ?? `temp-${show.id}`,
          ...previous,
          ...savedLog,
        }))
      }
    />
  );

  const triggerText = buttonLabel
    ? buttonLabel
    : currentLog
      ? `${typeM === "movie" ? "Movie" : "TV Show"} Already Logged`
      : `Log The ${typeM === "movie" ? "Movie" : "Tv Show"}`;

  const TriggerIcon = useEditIcon ? Pencil : CirclePlus;

  // ── Desktop — animated custom modal ──────────────────────────────
  if (isDesktop) {
    return (
      <>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowCard(true)}
            className={cn(
              "flex items-center gap-2 bg-primaryM-500 text-black hover:bg-primaryM-600 xsmd:text-xs",
              triggerClassName,
            )}
          >
            <TriggerIcon className="h-4 w-4" />
            {iconOnly ? (
              <span className="sr-only">{triggerText}</span>
            ) : (
              triggerText
            )}
          </Button>
        </div>

        <CustomModal open={showCard} onClose={() => setShowCard(false)}>
          {content}
        </CustomModal>
      </>
    );
  }

  // ── Mobile — Drawer (unchanged) ───────────────────────────────────
  return (
    <Drawer open={showCard} onOpenChange={setShowCard}>
      <div className="flex items-center gap-2">
        <DrawerTrigger asChild>
          <Button
            className={cn(
              "flex items-center gap-2 bg-primaryM-500 text-black hover:bg-primaryM-600 xsmd:text-xs",
              triggerClassName,
            )}
          >
            <span className="xsmd:text-xs">
              <TriggerIcon className="h-4 w-4" />
            </span>
            {iconOnly ? (
              <span className="sr-only">{triggerText}</span>
            ) : (
              triggerText
            )}
          </Button>
        </DrawerTrigger>

        {currentLog && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowCard(true)}
              className="h-10 w-10 rounded-full border border-white/15 bg-[rgba(13,12,15,0.9)] hover:bg-[rgba(23,23,28,0.9)]"
              title="Edit this log entry"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-10 w-10"
              title="Delete this log entry"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      <DrawerContent className="max-h-[88svh] overflow-hidden rounded-t-2xl border-t border-white/10 bg-[#1a1a1a] px-0 pt-0">
        <DrawerHeader className="sr-only">
          <DrawerTitle>
            Log The {typeM === "movie" ? "Movie" : "TV Show"}
          </DrawerTitle>
          <DrawerDescription>
            Log your rating, watch date, and optional review.
          </DrawerDescription>
        </DrawerHeader>
        <div className="min-h-0 overflow-y-auto overscroll-contain pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {content}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
