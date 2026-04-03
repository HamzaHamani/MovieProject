"use client";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import { TspecifiedMovie } from "@/types/api";
import { TspecifiedTv } from "@/types/apiTv";
import ModeleLog from "../ModeleLog";
import { getLoggedMovieTv, type TExistingLog } from "@/lib/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  show: TspecifiedMovie | TspecifiedTv; // Adjust the type according to your needs
  typeM?: "movie" | "tv";
  userId?: string;
  initialLog?: TExistingLog | null;
};

export default function LogTheMT({ show, typeM, userId, initialLog }: Props) {
  const [showCard, setShowCard] = useState(false);
  const [currentLog, setCurrentLog] = useState<TExistingLog | null>(
    initialLog ?? null,
  );
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    if (!showCard || !userId) return;

    (async () => {
      const freshLog = await getLoggedMovieTv(show.id);
      setCurrentLog(freshLog);
    })();
  }, [showCard, userId, show.id]);

  const loginRequiredContent = (
    <div className="space-y-5 py-3">
      <div className="space-y-2">
        <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
          <LogIn className="h-5 w-5 text-primaryM-500" /> Login Required
        </h3>
        <p className="text-sm text-gray-300">
          You need to login first to log this{" "}
          {typeM === "movie" ? "movie" : "TV show"}.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <Button
          asChild
          className="w-full bg-primaryM-500 text-black hover:bg-primaryM-600"
        >
          <Link href="/sign-in">Go to Sign In</Link>
        </Button>
      </div>
    </div>
  );

  const content = !userId ? (
    loginRequiredContent
  ) : (
    <ModeleLog
      typeM={typeM}
      show={show}
      setShowCard={setShowCard}
      initialLog={currentLog}
      onSaved={(savedLog) => setCurrentLog(savedLog)}
    />
  );

  if (isDesktop) {
    return (
      <Dialog open={showCard} onOpenChange={setShowCard}>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2 bg-primaryM-500 text-black hover:bg-primaryM-600 xsmd:text-xs">
            <span className="xsmd:text-xs">
              <CirclePlus />
            </span>
            {currentLog
              ? `${typeM === "movie" ? "Movie" : "TV Show"} Already Logged`
              : `Log The ${typeM === "movie" ? "Movie" : "Tv Show"}`}
          </Button>
        </DialogTrigger>

        <DialogContent className="max-h-[90vh] max-w-[980px] overflow-y-auto border-white/10 bg-[radial-gradient(circle_at_top,_rgba(234,179,8,0.12),transparent_45%),theme(colors.backgroundM)] p-5 pt-10 text-textMain xl:max-w-[900px] lg:max-w-[780px] md:max-w-[700px] sm:max-w-[94vw]">
          <DialogHeader className="sr-only">
            <DialogTitle>
              Log The {typeM === "movie" ? "Movie" : "TV Show"}
            </DialogTitle>
            <DialogDescription>
              Log your rating, watch date, and optional review.
            </DialogDescription>
          </DialogHeader>

          {!userId ? (
            <div className="space-y-5 py-3">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-white">
                  <LogIn className="h-5 w-5 text-primaryM-500" /> Login Required
                </DialogTitle>
                <DialogDescription className="text-gray-300">
                  You need to login first to log this{" "}
                  {typeM === "movie" ? "movie" : "TV show"}.
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <Button
                  asChild
                  className="w-full bg-primaryM-500 text-black hover:bg-primaryM-600"
                >
                  <Link href="/sign-in">Go to Sign In</Link>
                </Button>
              </div>
            </div>
          ) : (
            content
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={showCard} onOpenChange={setShowCard}>
      <DrawerTrigger asChild>
        <Button className="flex items-center gap-2 bg-primaryM-500 text-black hover:bg-primaryM-600 xsmd:text-xs">
          <span className="xsmd:text-xs">
            <CirclePlus />
          </span>
          {currentLog
            ? `${typeM === "movie" ? "Movie" : "TV Show"} Already Logged`
            : `Log The ${typeM === "movie" ? "Movie" : "Tv Show"}`}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[92vh] max-h-[92vh] overflow-y-auto border-white/10 bg-[radial-gradient(circle_at_top,_rgba(234,179,8,0.12),transparent_45%),theme(colors.backgroundM)] px-4 pb-5 text-textMain">
        <DrawerHeader className="sr-only">
          <DrawerTitle>
            Log The {typeM === "movie" ? "Movie" : "TV Show"}
          </DrawerTitle>
          <DrawerDescription>
            Log your rating, watch date, and optional review.
          </DrawerDescription>
        </DrawerHeader>

        {!userId && (
          <DrawerHeader className="px-0 pb-2 pt-0 text-left">
            <DrawerTitle className="text-white">Login Required</DrawerTitle>
            <DrawerDescription className="text-gray-300">
              Sign in to log your movie or TV show.
            </DrawerDescription>
          </DrawerHeader>
        )}
        {content}
      </DrawerContent>
    </Drawer>
  );
}
