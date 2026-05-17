"use client";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X, LogIn, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import CreateListForm from "../createListForm";
import { useQuery } from "@tanstack/react-query";
import {
  getBookmarks,
  getMovieLists,
  AddMovie,
  RemoveMovie,
} from "@/lib/actions";
import { showProfileMovieToast } from "@/components/profile/profileToasts";
import { bookmarksSchema } from "@/types";
import { z } from "zod";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

type BookmarkItem = z.infer<typeof bookmarksSchema>;

// ── Custom portal modal — fade + blur backdrop ────────────────────────────────
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

// ── Trigger button ────────────────────────────────────────────────────────────
function TriggerButton({
  triggerIcon,
  triggerLabel,
  triggerClassName,
  onClick,
}: {
  triggerIcon?: React.ReactNode;
  triggerLabel: string;
  triggerClassName?: string;
  onClick?: () => void;
}) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 border-gray-300/70 bg-transparent text-white hover:bg-white/10 xsmd:text-xs",
        triggerClassName,
      )}
    >
      <span>{triggerIcon ?? <PlusCircle className="h-4 w-4" />}</span>
      <span className="sss:hidden">{triggerLabel}</span>
    </Button>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function DrawerDialogButtonList({
  userId,
  movieId,
  itemTitle,
  itemPosterPath,
  triggerLabel = "Add List",
  triggerIcon,
  triggerClassName,
}: {
  userId?: string;
  movieId: string | number;
  itemTitle: string;
  itemPosterPath: string | null;
  triggerLabel?: string;
  triggerIcon?: React.ReactNode;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const sharedContent = (
    <ListModalContent
      userId={userId}
      movieId={movieId}
      itemTitle={itemTitle}
      itemPosterPath={itemPosterPath}
      onClose={() => setOpen(false)}
    />
  );

  if (isDesktop) {
    return (
      <>
        <TriggerButton
          triggerIcon={triggerIcon}
          triggerLabel={triggerLabel}
          triggerClassName={triggerClassName}
          onClick={() => setOpen(true)}
        />
        <CustomModal open={open} onClose={() => setOpen(false)}>
          {sharedContent}
        </CustomModal>
      </>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <TriggerButton
          triggerIcon={triggerIcon}
          triggerLabel={triggerLabel}
          triggerClassName={triggerClassName}
        />
      </DrawerTrigger>
      <DrawerContent className="max-h-[88svh] w-full overflow-hidden rounded-t-2xl border-t border-white/10 bg-[#1a1a1a] px-0 pt-0">
        <DrawerHeader className="sr-only">
          <DrawerTitle>Add to your lists</DrawerTitle>
          <DrawerDescription>
            Select one of your lists or create a new one.
          </DrawerDescription>
        </DrawerHeader>
        <div className="min-h-0 overflow-y-auto overscroll-contain pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {sharedContent}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// ── Modal body ────────────────────────────────────────────────────────────────
function ListModalContent({
  userId,
  movieId,
  itemTitle,
  itemPosterPath,
  onClose,
}: {
  userId?: string;
  movieId: string | number;
  itemTitle: string;
  itemPosterPath: string | null;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col bg-backgroundM">
      <div className="px-6 pb-5 pt-6">
        <span className="mb-3 inline-block rounded-full bg-primaryM-600 px-3 py-0.5 text-[10px] font-medium uppercase tracking-widest text-black">
          Your Lists
        </span>
        <h2 className="text-xl font-medium text-white">Add to your lists</h2>
        <p className="mt-1 text-sm text-white/40">
          Select one of your lists or create a new one.
        </p>
        <div className="mt-5 h-px w-full bg-white/10" />
      </div>
      <div className="flex flex-col gap-5 px-6 pb-4">
        <ProfileForm
          userId={userId}
          movieId={movieId}
          itemTitle={itemTitle}
          itemPosterPath={itemPosterPath}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

// ── Shared footer ─────────────────────────────────────────────────────────────
function Footer({
  onClose,
  primaryLabel,
  primaryDisabled,
  onPrimary,
  primaryHref,
}: {
  onClose?: () => void;
  primaryLabel: React.ReactNode;
  primaryDisabled?: boolean;
  onPrimary?: () => void;
  primaryHref?: string;
}) {
  return (
    <div className="sticky bottom-0 z-10 flex gap-2.5 border-t border-white/10 bg-backgroundM py-4">
      <button
        type="button"
        onClick={onClose}
        className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] py-3 text-sm font-medium text-white/50 transition hover:bg-white/[0.08] hover:text-white/70"
      >
        Cancel
      </button>
      {primaryHref ? (
        <Link
          href={primaryHref}
          className="flex flex-[2] items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-black transition hover:opacity-90"
          style={{ background: "#c9a227" }}
        >
          {primaryLabel}
        </Link>
      ) : (
        <button
          type="button"
          disabled={primaryDisabled}
          onClick={onPrimary}
          className="flex flex-[2] items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-50"
          style={{ background: "#c9a227" }}
        >
          {primaryLabel}
        </button>
      )}
    </div>
  );
}

// ── Reskinned list rows — CheckBoxes logic inlined verbatim ───────────────────
function StyledCheckBoxes({
  data,
  movieId,
  itemTitle,
  itemPosterPath,
  MoiveListsData,
}: {
  data: BookmarkItem[];
  movieId: any;
  itemTitle: string;
  itemPosterPath: string | null;
  MoiveListsData: any;
}) {
  // ── exact logic from CheckBoxes.tsx ──────────────────────────────
  const bookmarkIds = MoiveListsData?.map((item: any) => item.bookmarkId) || [];
  const [selectedLists, setSelectedLists] =
    React.useState<(string | number)[]>(bookmarkIds);
  const [loadingIds, setLoadingIds] = React.useState<Record<string, boolean>>(
    {},
  );

  React.useEffect(() => {
    setSelectedLists(bookmarkIds);
  }, [movieId, JSON.stringify(bookmarkIds)]);

  const handleSelect = async (listId: string | number) => {
    const listKey = String(listId);
    if (loadingIds[listKey]) return;

    const isSelected = selectedLists.includes(listId);
    const nextSelected = isSelected
      ? selectedLists.filter((id) => id !== listId)
      : [...selectedLists, listId];

    setSelectedLists(nextSelected);
    setLoadingIds((prev) => ({ ...prev, [listKey]: true }));

    try {
      const selectedList = data.find((item) => item.id === listId);
      const selectedListName = selectedList?.bookmarkName ?? "your list";

      if (isSelected) {
        const res = await RemoveMovie({ bookmarkId: listKey, movieId });
        if (!res?.removed) {
          setSelectedLists((prev) => [...prev, listId]);
          return;
        }
        showProfileMovieToast({
          title: itemTitle,
          message: `Removed from ${selectedListName}`,
          posterPath: itemPosterPath,
        });
      } else {
        const res = await AddMovie({
          bookmarkId: listKey,
          review: "",
          movieId,
        });
        if (res?.already) {
          showProfileMovieToast({
            title: itemTitle,
            message: `Already in ${selectedListName}`,
            posterPath: itemPosterPath,
          });
        } else {
          showProfileMovieToast({
            title: itemTitle,
            message: `Added to ${selectedListName}`,
            posterPath: itemPosterPath,
          });
        }
      }
    } catch {
      setSelectedLists((prev) =>
        isSelected ? [...prev, listId] : prev.filter((id) => id !== listId),
      );
      showProfileMovieToast({
        title: "Error",
        message: "Couldn't update your list",
        posterPath: null,
      });
    } finally {
      setLoadingIds((prev) => {
        const next = { ...prev };
        delete next[listKey];
        return next;
      });
    }
  };

  // ── new card UI ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-2.5">
      {data.map((item) => {
        const checked = selectedLists.includes(item.id);
        const loading = !!loadingIds[String(item.id)];
        const alreadyIn = bookmarkIds.includes(item.id);

        return (
          <button
            key={item.id}
            type="button"
            disabled={loading}
            onClick={() => handleSelect(item.id)}
            className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left transition-all duration-150 disabled:opacity-60"
            style={{
              background: checked ? "#201c0f" : "rgba(255,255,255,0.04)",
              border: checked
                ? "1.5px solid #c9a227"
                : "1.5px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Custom checkbox */}
            <span
              className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md transition-all duration-150"
              style={{
                background: checked ? "#c9a227" : "transparent",
                border: checked
                  ? "1.5px solid #c9a227"
                  : "1.5px solid rgba(255,255,255,0.3)",
              }}
            >
              {loading ? (
                <svg
                  className="animate-spin"
                  width="11"
                  height="11"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <circle
                    cx="6"
                    cy="6"
                    r="4.5"
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M6 1.5A4.5 4.5 0 0 1 10.5 6"
                    stroke="#1a1100"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              ) : checked ? (
                <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                  <path
                    d="M1 3.5L4 6.5L10 1"
                    stroke="#1a1100"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : null}
            </span>

            {/* Text */}
            <span className="flex flex-1 flex-col gap-0.5">
              <span
                className="text-sm font-medium transition-colors duration-150"
                style={{
                  color: checked ? "#f0f0f0" : "rgba(255,255,255,0.85)",
                }}
              >
                {item.bookmarkName}
              </span>
              {item.description ? (
                <span
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.38)" }}
                >
                  {item.description}
                </span>
              ) : null}
              {/* "Already added" hint — only when it was pre-existing and still checked */}
              {checked && alreadyIn && (
                <span className="text-xs" style={{ color: "#c9a227" }}>
                  Already added
                </span>
              )}
            </span>

            {/* Item count — hardcoded for now, make dynamic as needed */}
            {(item as any).itemCount !== undefined && (
              <span
                className="flex-shrink-0 text-xs"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                {(item as any).itemCount}{" "}
                {(item as any).itemCount === 1 ? "title" : "titles"}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── ProfileForm ───────────────────────────────────────────────────────────────
export function ProfileForm({
  movieId,
  className,
  userId,
  itemTitle,
  itemPosterPath,
  onClose,
}: {
  className?: string;
  userId?: string;
  movieId: string | number;
  itemTitle: string;
  itemPosterPath: string | null;
  onClose?: () => void;
}) {
  const isLoggedIn = Boolean(userId);
  const [showForm, setShowForm] = React.useState(false);

  const { data: MoiveListsData } = useQuery({
    queryKey: ["movieLists", movieId],
    queryFn: () => getMovieLists(String(movieId)),
    enabled: isLoggedIn,
  });

  const { data, error, isLoading } = useQuery({
    queryKey: ["bookmarks", userId],
    queryFn: () => getBookmarks(userId as string),
    enabled: isLoggedIn,
  });

  // ── Not logged in ─────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className={cn("flex flex-col gap-5", className)}>
        <div className="flex flex-col items-center gap-6 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <LogIn className="h-7 w-7 text-amber-400" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-medium text-white">Login required</h3>
            <p className="text-sm text-white/45">
              You need to be signed in to manage your lists.
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

  // ── Loading ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className={cn("flex flex-col gap-5", className)}>
        <div className="flex flex-col gap-2.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex animate-pulse items-center gap-4 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5"
            >
              <div className="h-5 w-5 flex-shrink-0 rounded-md bg-white/10" />
              <div className="flex flex-col gap-2">
                <div className="h-3 w-28 rounded bg-white/10" />
                <div className="h-2.5 w-44 rounded bg-white/[0.06]" />
              </div>
              <div className="ml-auto h-2.5 w-12 rounded bg-white/[0.06]" />
            </div>
          ))}
        </div>
        <Footer
          onClose={onClose}
          primaryDisabled
          primaryLabel={
            <>
              <Plus className="h-4 w-4" />
              Create list
            </>
          }
        />
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className={cn("flex flex-col gap-5", className)}>
        <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-400">
          Could not load your lists. Please try again.
        </div>
        <Footer onClose={onClose} primaryDisabled primaryLabel="Create list" />
      </div>
    );
  }

  const bookmarksData: BookmarkItem[] = data ?? [];

  // ── Main ──────────────────────────────────────────────────────────
  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <div className="flex flex-col gap-2.5">
        {showForm ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <CreateListForm
              setShowForm={setShowForm}
              userId={userId as string}
            />
          </div>
        ) : bookmarksData.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-8 text-center">
            <p className="text-sm text-white/40">
              You have no lists yet. Create your first one below.
            </p>
          </div>
        ) : (
          <StyledCheckBoxes
            data={bookmarksData}
            movieId={movieId}
            itemTitle={itemTitle}
            itemPosterPath={itemPosterPath}
            MoiveListsData={MoiveListsData}
          />
        )}
      </div>

      <Footer
        onClose={onClose}
        onPrimary={() => setShowForm((v) => !v)}
        primaryLabel={
          showForm ? (
            "Cancel"
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Create list
            </>
          )
        }
      />
    </div>
  );
}
