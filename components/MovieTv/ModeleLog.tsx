import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon } from "lucide-react";
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

type Props = {
  typeM: "movie" | "tv" | undefined;
  show: TspecifiedMovie | TspecifiedTv; // Adjust the type according to your needs
  setShowCard: (show: boolean) => void;
};

export default function ModeleLog({ typeM, show, setShowCard }: Props) {
  const [reviewTitle, setReviewTitle] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [errors, setErrors] = useState<{
    reviewTitle?: string;
    rating?: string;
    date?: string;
  }>({
    reviewTitle: undefined,
    rating: undefined,
    date: undefined,
  });

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const newErrors: { reviewTitle?: string; rating?: string; date?: string } =
      {};
    if (!reviewTitle.trim()) newErrors.reviewTitle = "Title is required.";
    if (!rating) newErrors.rating = "Rating is required.";
    if (!date) newErrors.date = "Date is required.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    if (!date) return; // Ensure date is defined
    const logData = {
      reviewTitle,
      rating,
      date: date.toISOString(),
      review,
      showId: show.id,
    };
    sendLoggedMovieTv(logData);

    setShowCard(false); // Close the modal
    console.log(logData); // You can replace this with your API call or state update
    // Optionally close the modal or reset fields here
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backdropFilter: "blur(8px)",
        background: "rgba(0,0,0,0.3)",
      }}
      onClick={() => setShowCard(false)} // <-- Close modal on background click
    >
      <div
        className="relative mx-auto w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute right-4 top-4 text-2xl text-gray-400 hover:text-white"
          onClick={() => setShowCard(false)}
          aria-label="Close"
        >
          ×
        </button>
        <Card className="border-none bg-backgroundM text-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">
              Log {typeM === "movie" ? (show as any).title : (show as any).name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Title</label>
              <Input
                placeholder="Enter Title for your log"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                className="border border-primaryM-800 text-white placeholder-gray-400"
              />
              {errors.reviewTitle && (
                <div className="mt-1 text-xs text-red-400">
                  {errors.reviewTitle}
                </div>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Rating</label>
              <div
                className="mt-1 flex justify-center gap-2"
                onMouseLeave={() => setHovered(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => {
                  const value = hovered || rating;
                  const isFull = value >= star;
                  const isHalf = value + 0.5 === star;

                  // SVG path for sharp Letterboxd-like star
                  const starPath =
                    "M12 2.25l3.09 6.26 6.91 1-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.38l-5-4.87 6.91-1L12 2.25z";

                  // Colors
                  const activeFill = "var(--bg-primaryM-100, #ffb700)";
                  const inactiveColor = "#232323";

                  return (
                    <button
                      key={star}
                      type="button"
                      className="b relative p-1"
                      aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                      style={{ lineHeight: 0 }}
                      onMouseMove={(e) => {
                        const { left, width } =
                          e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - left;
                        if (x < width / 2) {
                          setHovered(star - 0.5);
                        } else {
                          setHovered(star);
                        }
                      }}
                      onClick={(e) => {
                        const { left, width } =
                          e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - left;
                        let newRating = 0;
                        if (
                          (x < width / 2 && rating === star - 0.5) ||
                          (x >= width / 2 && rating === star)
                        ) {
                          newRating = 0;
                        } else {
                          newRating = x < width / 2 ? star - 0.5 : star;
                        }
                        setRating(newRating);
                      }}
                    >
                      <svg
                        width={40}
                        height={40}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={isFull || isHalf ? activeFill : inactiveColor}
                        strokeWidth={isFull || isHalf ? 1.5 : 1}
                        className={`transition-all`}
                      >
                        <defs>
                          <linearGradient id={`half-gradient-${star}`}>
                            <stop
                              offset="50%"
                              stopColor={
                                isFull || isHalf ? activeFill : inactiveColor
                              }
                            />
                            <stop offset="50%" stopColor={inactiveColor} />
                          </linearGradient>
                        </defs>
                        {isFull ? (
                          <path d={starPath} fill={activeFill} />
                        ) : isHalf ? (
                          <path
                            d={starPath}
                            fill={`url(#half-gradient-${star})`}
                          />
                        ) : (
                          <path d={starPath} fill={inactiveColor} />
                        )}
                      </svg>
                    </button>
                  );
                })}
              </div>
              {errors.rating && (
                <div className="mt-1 text-xs text-red-400">{errors.rating}</div>
              )}
            </div>
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium">
                <CalendarIcon className="inline-block" /> When did you watch it?
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start border border-primaryM-800 text-left font-normal text-white"
                  >
                    {date ? format(date, "MM/dd/yyyy") : "mm / dd / yyyy"}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="bg w-auto border-white p-0 text-textMain">
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
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Review <span className="text-gray-400">(Optional)</span>
              </label>
              <Textarea
                placeholder="Share your thoughts about the movie..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="border border-primaryM-900 text-white placeholder-gray-400"
                rows={4}
                maxLength={500}
              />
              <div className="mt-1 text-xs text-gray-400">
                {review.length} characters
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              className="flex-1 bg-yellow-500 font-semibold text-black hover:bg-yellow-600"
              onClick={handleSubmit}
              type="button"
            >
              Log Movie
            </Button>
            <Button
              variant="outline"
              className="border border-[#232b3a] bg-[#232b3a] text-white"
              onClick={() => setShowCard(false)}
              type="button"
            >
              Cancel
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
