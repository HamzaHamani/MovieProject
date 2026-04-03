import React, { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Star } from "lucide-react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { TspecifiedMovie } from "@/types/api";
import { TspecifiedTv } from "@/types/apiTv";
import { Button } from "../ui/button";
import { sendLoggedMovieTv } from "@/lib/actions";
import { toast } from "sonner";

type Props = {
  typeM: "movie" | "tv" | undefined;
  show: TspecifiedMovie | TspecifiedTv; // Adjust the type according to your needs
  setShowCard: (show: boolean) => void;
  initialLog?: {
    rating: number;
    review: string;
    watchedAt: string;
    watchType: "first" | "rewatch";
  } | null;
  onSaved?: (savedLog: {
    rating: number;
    review: string;
    watchedAt: string;
    watchType: "first" | "rewatch";
  }) => void;
};

export default function ModeleLog({
  typeM,
  show,
  setShowCard,
  initialLog,
  onSaved,
}: Props) {
  const [date, setDate] = useState<Date | undefined>(
    initialLog?.watchedAt ? new Date(initialLog.watchedAt) : undefined,
  );
  const [review, setReview] = useState(initialLog?.review ?? "");
  const [rating, setRating] = useState(initialLog?.rating ?? 0);
  const [watchTime, setWatchTime] = useState<"first" | "rewatch">(
    initialLog?.watchType ?? "first",
  );
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    rating?: string;
    date?: string;
  }>({
    rating: undefined,
    date: undefined,
  });

  useEffect(() => {
    if (!initialLog) return;

    setDate(initialLog.watchedAt ? new Date(initialLog.watchedAt) : undefined);
    setReview(initialLog.review ?? "");
    setRating(initialLog.rating ?? 0);
    setWatchTime(initialLog.watchType ?? "first");
  }, [initialLog]);

  const getRatingFromPointer = (
    e: React.MouseEvent<HTMLButtonElement>,
    star: number,
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isHalf = x < rect.width / 2;

    return isHalf ? star - 0.5 : star;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const newErrors: { rating?: string; date?: string } = {};
    if (!rating) newErrors.rating = "Rating is required.";
    if (!date) newErrors.date = "Date is required.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    if (!date) return; // Ensure date is defined
    const logData = {
      rating,
      date: date.toISOString(),
      review,
      watchType: watchTime,
      showId: show.id,
    };

    try {
      setSubmitting(true);
      const res = await sendLoggedMovieTv(logData);

      const title =
        typeM === "movie" ? (show as any).title : (show as any).name;
      const posterPath = (show as any)?.poster_path ?? null;

      if (res.already) {
        toast.custom(
          () => (
            <div className="flex w-[330px] items-center gap-3 rounded-xl border border-white/15 bg-backgroundM p-2.5 text-textMain shadow-lg">
              <div className="h-12 w-12 overflow-hidden rounded-md bg-white/10">
                {posterPath ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w185/${posterPath}`}
                    alt={title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-white/60">
                    No image
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{title}</p>
                <p className="text-xs text-gray-300">Movie log updated</p>
              </div>
            </div>
          ),
          { position: "bottom-left", duration: 3500 },
        );
        onSaved?.({
          rating,
          review,
          watchedAt: date.toISOString(),
          watchType: watchTime,
        });
        setShowCard(false);
        return;
      }

      toast.custom(
        () => (
          <div className="flex w-[330px] items-center gap-3 rounded-xl border border-white/15 bg-backgroundM p-2.5 text-textMain shadow-lg">
            <div className="h-12 w-12 overflow-hidden rounded-md bg-white/10">
              {posterPath ? (
                <img
                  src={`https://image.tmdb.org/t/p/w185/${posterPath}`}
                  alt={title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] text-white/60">
                  No image
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{title}</p>
              <p className="text-xs text-gray-300">Movie added to your log</p>
            </div>
          </div>
        ),
        { position: "bottom-left", duration: 3500 },
      );

      onSaved?.({
        rating,
        review,
        watchedAt: date.toISOString(),
        watchType: watchTime,
      });
      setShowCard(false);
    } catch {
      toast.error("Could not log this item. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const showTitle =
    typeM === "movie" ? (show as any).title : (show as any).name;
  const activeStarCount = hoveredStar || rating;

  return (
    <form className="space-y-6 pb-28" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <span className="w-fit rounded-full border border-primaryM-500/40 bg-primaryM-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primaryM-500">
          {typeM === "movie" ? "Movie Log" : "TV Log"}
        </span>
        <h2 className="text-2xl font-semibold text-white">Log {showTitle}</h2>
        <p className="text-sm text-gray-300">
          Save your rating and review for this{" "}
          {typeM === "movie" ? "movie" : "show"}.
        </p>
      </div>

      <div className="grid grid-cols-2 items-stretch gap-4 sm:grid-cols-1">
        <div className="h-full rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="space-y-4">
            <label className="mb-1 block text-sm font-medium text-white">
              Rating
            </label>
            <div
              className="mt-2 flex w-full items-center justify-between gap-2"
              onMouseLeave={() => setHoveredStar(0)}
            >
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((value) => {
                  const displayRating = hoveredStar || rating;
                  const fillPercent = Math.max(
                    0,
                    Math.min(1, displayRating - (value - 1)),
                  );

                  return (
                    <button
                      key={value}
                      type="button"
                      onMouseMove={(e) =>
                        setHoveredStar(getRatingFromPointer(e, value))
                      }
                      onFocus={() => setHoveredStar(value)}
                      onClick={(e) => setRating(getRatingFromPointer(e, value))}
                      aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
                      className="rounded-md p-1 transition hover:bg-white/10"
                    >
                      <div className="relative h-7 w-7">
                        <Star className="h-7 w-7 text-white/25" />
                        <div
                          className="absolute inset-0 overflow-hidden"
                          style={{ width: `${fillPercent * 100}%` }}
                        >
                          <Star className="h-7 w-7 fill-primaryM-500 text-primaryM-500" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <span className="w-20 text-right text-sm text-gray-300">
                {rating ? `${rating.toFixed(1)}/5` : "Tap a star"}
              </span>
            </div>
            {errors.rating && (
              <div className="mt-1 text-xs text-red-400">{errors.rating}</div>
            )}

            <label className="mb-1 flex items-center gap-2 text-sm font-medium text-white">
              <CalendarIcon className="inline-block" /> When did you watch it?
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start border-white/20 bg-white/5 text-left font-normal text-white hover:bg-white/10"
                >
                  {date ? format(date, "MM/dd/yyyy") : "mm / dd / yyyy"}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                portalled={false}
                className="w-auto border-white p-0 text-textMain"
              >
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <div className="mt-1 text-xs text-red-400">{errors.date}</div>
            )}

            <div className="mt-3 w-full">
              <label className="mb-2 block text-sm font-medium text-white">
                Watch Type
              </label>
              <div className="grid w-full grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWatchTime("first")}
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition ${
                    watchTime === "first"
                      ? "border-primaryM-500 bg-primaryM-500 text-black"
                      : "border-white/20 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  First Time
                </button>
                <button
                  type="button"
                  onClick={() => setWatchTime("rewatch")}
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition ${
                    watchTime === "rewatch"
                      ? "border-primaryM-500 bg-primaryM-500 text-black"
                      : "border-white/20 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  Rewatch
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-full w-full flex-col rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <label className="mb-1 block text-sm font-medium text-white">
            Review <span className="text-gray-400">(Optional)</span>
          </label>
          <Textarea
            placeholder="Share your thoughts..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="min-h-[260px] w-full flex-1 resize-y border-white/20 bg-white/5 text-white placeholder:text-gray-400 sm:min-h-[160px]"
            rows={8}
            maxLength={500}
          />
          <div className="mt-1 text-xs text-gray-400">
            {review.length} characters
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 -mx-1 flex flex-row gap-2 rounded-xl border border-white/10 bg-backgroundM/95 p-2 backdrop-blur sm:flex-col">
        <Button
          variant="outline"
          className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10"
          onClick={() => setShowCard(false)}
          type="button"
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button
          className="w-full flex-1 bg-primaryM-500 font-semibold text-black hover:bg-primaryM-600"
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? "Saving..."
            : `Log ${typeM === "movie" ? "Movie" : "TV Show"}`}
        </Button>
      </div>
    </form>
  );
}
