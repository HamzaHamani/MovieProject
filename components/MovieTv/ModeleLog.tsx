import React, { useEffect, useState } from "react";
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
import { sendLoggedMovieTv } from "@/lib/actions";
import { encodeStoredMediaId } from "@/lib/utils";
import { showProfileMovieToast } from "@/components/profile/profileToasts";
import { showErrorNotification } from "@/components/notificationSystem";
import MentionTextarea from "@/components/ui/mentionTextarea";

type Props = {
  typeM: "movie" | "tv" | undefined;
  show: TspecifiedMovie | TspecifiedTv;
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
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ rating?: string; date?: string }>({});

  useEffect(() => {
    if (initialLog) {
      setDate(
        initialLog.watchedAt ? new Date(initialLog.watchedAt) : undefined,
      );
      setReview(initialLog.review ?? "");
      setRating(initialLog.rating ?? 0);
      setWatchTime(initialLog.watchType ?? "first");
    } else {
      setDate(undefined);
      setReview("");
      setRating(0);
      setWatchTime("first");
    }
    setHoveredStar(null);
  }, [initialLog, show.id]);

  const getRatingFromPointer = (
    e: React.MouseEvent<HTMLButtonElement>,
    star: number,
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    return x < rect.width / 2 ? star - 0.5 : star;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const newErrors: { rating?: string; date?: string } = {};
    if (!rating) newErrors.rating = "Rating is required.";
    if (!date) newErrors.date = "Date is required.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    if (!date) return;

    const logData = {
      rating,
      date: date.toISOString(),
      review,
      watchType: watchTime,
      showId: encodeStoredMediaId(show.id, typeM === "movie" ? "movie" : "tv"),
    };

    try {
      setSubmitting(true);
      const res = await sendLoggedMovieTv(logData);
      const title =
        typeM === "movie" ? (show as any).title : (show as any).name;
      const posterPath = (show as any)?.poster_path ?? null;
      showProfileMovieToast({
        title,
        message: res.already ? "Movie log updated" : "Movie added to your log",
        posterPath,
      });
      onSaved?.({
        rating,
        review,
        watchedAt: date.toISOString(),
        watchType: watchTime,
      });
      setShowCard(false);
    } catch {
      showErrorNotification(
        "Error",
        "Could not log this item. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const showTitle =
    typeM === "movie" ? (show as any).title : (show as any).name;
  const displayRating = hoveredStar !== null ? hoveredStar : rating;

  const getStarMode = (value: number) => {
    if (displayRating >= value) return "full" as const;
    if (displayRating >= value - 0.5) return "half" as const;
    return "empty" as const;
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col bg-backgroundM">
      {/* Header */}
      <div className="px-6 pb-5 pt-6">
        <span className="mb-3 inline-block rounded-full bg-primaryM-600 px-3 py-0.5 text-[10px] font-medium uppercase tracking-widest text-black">
          {typeM === "movie" ? "Movie log" : "TV show log"}
        </span>
        <h2 className="text-xl font-medium text-white">Log {showTitle}</h2>
        <p className="mt-1 text-sm text-white/40">
          Save your rating and review for this{" "}
          {typeM === "movie" ? "movie" : "show"}.
        </p>
        <div className="mt-5 h-px w-full bg-white/10" />
      </div>

      {/* Body */}
      <div className="flex flex-col gap-5 px-6 pb-4">
        {/* Rating */}
        <div>
          <p className="mb-2.5 text-[11px] font-medium uppercase tracking-widest text-white/40">
            Your rating
          </p>
          <div
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5"
            onMouseLeave={() => setHoveredStar(null)}
          >
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => {
                const mode = getStarMode(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onMouseMove={(e) =>
                      setHoveredStar(getRatingFromPointer(e, value))
                    }
                    onMouseEnter={() => setHoveredStar(value)}
                    onClick={(e) => {
                      setRating(getRatingFromPointer(e, value));
                      setHoveredStar(null);
                    }}
                    aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
                    className="rounded-md p-0.5 transition hover:bg-white/5"
                  >
                    <div className="relative h-7 w-7">
                      <Star className="h-7 w-7 fill-transparent text-white/20" />
                      {mode === "full" && (
                        <Star className="absolute inset-0 h-7 w-7 fill-amber-400 text-amber-400" />
                      )}
                      {mode === "half" && (
                        <div className="absolute inset-0 overflow-hidden [clip-path:inset(0_50%_0_0)]">
                          <Star className="h-7 w-7 fill-amber-400 text-amber-400" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <span
              className="min-w-[52px] text-right text-sm font-medium"
              style={{
                color: displayRating ? "#c9a227" : "rgba(255,255,255,0.3)",
              }}
            >
              {displayRating ? `${displayRating.toFixed(1)} / 5` : "— / 5"}
            </span>
          </div>{" "}
          {errors.rating && (
            <p className="mt-1.5 text-xs text-red-400">{errors.rating}</p>
          )}
        </div>

        {/* Date + Watch Type */}
        <div className="flex justify-between gap-3">
          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-white/40">
              Date watched
            </p>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="text- flex h-11 w-44 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-center text-sm transition hover:bg-white/[0.07]"
                >
                  <CalendarIcon className="h-4 w-4 shrink-0 text-white/40" />
                  <span className={date ? "text-white/80" : "text-white/30"}>
                    {date ? format(date, "MM/dd/yyyy") : "mm / dd / yyyy"}
                  </span>
                </button>
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
              <p className="mt-1.5 text-xs text-red-400">{errors.date}</p>
            )}
          </div>

          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-white/40">
              Watch type
            </p>
            <div className="flex h-11 w-56 gap-1.5">
              {(["first", "rewatch"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setWatchTime(type)}
                  className="flex-1 whitespace-nowrap rounded-xl text-xs font-medium transition-all"
                  style={{
                    background:
                      watchTime === type ? "#c9a227" : "rgba(255,255,255,0.06)",
                    color:
                      watchTime === type ? "#1a1a1a" : "rgba(255,255,255,0.5)",
                    border:
                      watchTime === type
                        ? "none"
                        : "0.5px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {type === "first" ? "First time" : "Rewatch"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Review */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-medium uppercase tracking-widest text-white/40">
              Review
            </p>
            <span className="text-[11px] text-white/25">Optional</span>
          </div>
          <MentionTextarea
            placeholder="Share your thoughts..."
            value={review}
            onChange={setReview}
            className="min-h-[160px] w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] text-white placeholder:text-white/25"
            rows={6}
            maxLength={500}
          />
          <p className="mt-1.5 text-xs text-white/25">{review.length} / 500</p>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 z-10 flex gap-2.5 border-t border-white/10 bg-backgroundM px-6 py-4">
        <button
          type="button"
          disabled={submitting}
          onClick={() => setShowCard(false)}
          className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] py-3 text-sm font-medium text-white/50 transition hover:bg-white/[0.08] hover:text-white/70 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-[2] rounded-xl py-3 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-50"
          style={{ background: "#c9a227" }}
        >
          {submitting
            ? "Saving..."
            : `Log ${typeM === "movie" ? "movie" : "TV show"}`}
        </button>
      </div>
    </form>
  );
}
