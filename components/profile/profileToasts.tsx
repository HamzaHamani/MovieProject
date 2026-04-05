"use client";

import { toast } from "sonner";

type MovieToastInput = {
  title: string;
  message: string;
  posterPath?: string | null;
};

export function showProfileMovieToast({
  title,
  message,
  posterPath,
}: MovieToastInput) {
  toast.custom(
    () => (
      <div className="flex h-12 w-[330px] items-stretch overflow-hidden rounded-xl border border-white/15 bg-backgroundM text-textMain shadow-lg">
        <div className="h-full w-12 shrink-0 overflow-hidden bg-white/10">
          {posterPath ? (
            <img
              src={`https://image.tmdb.org/t/p/w185/${posterPath}`}
              alt={title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-white/60">
              Info
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center px-3 py-0">
          <p className="truncate text-sm font-semibold leading-tight">
            {title}
          </p>
          <p className="truncate text-xs leading-tight text-gray-300">
            {message}
          </p>
        </div>
      </div>
    ),
    { position: "bottom-left", duration: 3500 },
  );
}
