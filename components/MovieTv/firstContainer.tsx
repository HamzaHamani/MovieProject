import { convertRuntime } from "@/lib/utils";
import { TspecifiedMovie } from "@/types/api";
import { StarIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { TspecifiedTv } from "@/types/apiTv";
import ShareButton from "./buttons/shareButton";
import { Button } from "../ui/button";
import { DrawerDialogButtonList } from "./buttons/draweDialogButtonList";
import {
  getLoggedMovieTv,
  getUser,
  getWatchedByForShow,
  getReviewStats,
} from "@/lib/actions";
import UserReviewPreview from "./userReviewPreview";
import LogTheMT from "./buttons/logTheMT";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";

type TspecifiedMedia = TspecifiedMovie | TspecifiedTv;
type Props = { response: TspecifiedMedia; typeM: "movie" | "tv" };

const getInitials = (label: string) => {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
};

function WatchedByRow({
  watchedBy,
}: {
  watchedBy: Awaited<ReturnType<typeof getWatchedByForShow>>;
}) {
  if (!watchedBy.length) return null;
  const visible = watchedBy.slice(0, 4);
  const extra = watchedBy.length - 4;

  return (
    <div className="flex items-center gap-2">
      <span className="mt-0 text-[12.5px] uppercase tracking-[0.18em] text-white/30">
        Watched by
      </span>
      <div className="flex -space-x-2">
        {visible.map((item) => {
          const display = item.username || item.name || "User";
          const avatar = (
            <Avatar className="h-6 w-6 border-2 border-[#0d0c0f] ring-1 ring-white/10 transition duration-200 hover:scale-110 hover:ring-primaryM-500/40">
              <AvatarImage src={item.image ?? undefined} alt={display} />
              <AvatarFallback className="bg-white/10 text-[8px] text-white">
                {getInitials(display)}
              </AvatarFallback>
            </Avatar>
          );
          return item.username ? (
            <Link
              key={item.userId}
              href={`/profile/${item.username}/review/${item.reviewId}`}
              className="group relative"
              aria-label={`Open ${display}'s review`}
            >
              {avatar}
              <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-[#111114] px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                @{display}
              </span>
            </Link>
          ) : (
            <span key={item.userId}>{avatar}</span>
          );
        })}
        {extra > 0 && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#0d0c0f] bg-white/10 text-[8px] font-medium text-white/50">
            +{extra}
          </div>
        )}
      </div>
    </div>
  );
}

export default async function FirstContainer({ response, typeM }: Props) {
  const user = await getUser();

  if (typeM === "movie") {
    const movieRes = response as TspecifiedMovie;
    const primaryGenre = movieRes.genres?.[0]?.name ?? "Unknown";
    const secondaryGenre = movieRes.genres?.[1]?.name;
    const rating =
      typeof movieRes.vote_average === "number"
        ? movieRes.vote_average.toFixed(1)
        : "--";
    const revenueLabel =
      typeof movieRes.revenue === "number"
        ? `$${(movieRes.revenue / 1_000_000).toFixed(0)}M`
        : "--";
    const runtime = convertRuntime(movieRes.runtime);

    const [existingLog, watchedBy] = user?.id
      ? await Promise.all([
          getLoggedMovieTv(movieRes.id, "movie"),
          getWatchedByForShow(String(movieRes.id)),
        ])
      : [null, []];

    const reviewStats = existingLog
      ? await getReviewStats(existingLog.id)
      : { likesCount: 0, repliesCount: 0 };

    return (
      <div className="mt-[32vh] flex w-[90vw] flex-col gap-4 md:mb-0 md:mt-0 md:w-full">
        <div className="flex flex-row items-start justify-between gap-8 md:flex-col md:gap-4">
          {/* ── Left: movie info — full width when stacked on mobile ── */}
          <div className="flex min-w-0 flex-1 flex-col gap-4 md:w-full md:gap-3">
            <Badge className="w-fit bg-backgroundM px-4 text-base font-normal sm:px-2 sm:text-xs">
              Movie
            </Badge>
            <h2 className="text-5xl font-extrabold tracking-tighter text-textMain smd:text-3xl">
              {movieRes.title}
            </h2>
            <div className="flex w-fit flex-wrap gap-2 text-sm text-gray-300 smd:gap-1 smd:text-xs s:text-[10px]">
              <span>{runtime}</span>
              <span>•</span>
              <span>{movieRes.release_date}</span>
              <span>•</span>
              <span>{primaryGenre}</span>
              {secondaryGenre && (
                <>
                  <span>•</span>
                  <span>{secondaryGenre}</span>
                </>
              )}
              <span>•</span>
              <span className="flex items-center gap-1">
                <StarIcon className="inline h-3.5 w-3.5 text-primaryM-400" />
                {rating}
              </span>
              <span>•</span>
              <span>{revenueLabel}</span>
            </div>

            {/* ── Action buttons ── */}
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <LogTheMT
                show={response}
                typeM={typeM}
                userId={user?.id}
                initialLog={existingLog}
              />
              <DrawerDialogButtonList
                userId={user?.id}
                movieId={movieRes.id}
                itemTitle={movieRes.title}
                itemPosterPath={movieRes.poster_path}
              />
              <ShareButton typeSearch="Movie" />
              <Button asChild variant="default" size="default">
                <Link href={`/player/movie/${movieRes.id}`} className="">
                  Watch it
                </Link>
              </Button>
            </div>

            {/* ── Watched by ── */}
            <WatchedByRow watchedBy={watchedBy} />

            {/* ── Review card: mobile only, truly full width ── */}
            {existingLog && (
              <div className="hidden md:mt-1 md:block md:w-full">
                <UserReviewPreview
                  log={existingLog}
                  username={user?.username ?? null}
                  likesCount={reviewStats.likesCount}
                  repliesCount={reviewStats.repliesCount}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* ── Right column: desktop only, hidden on mobile ── */}
          {existingLog && (
            <div className="w-[400px] shrink-0 xxl:w-[380px] xl:w-[360px] lg:w-[320px] xmd:w-[280px] md:hidden">
              <UserReviewPreview
                log={existingLog}
                username={user?.username ?? null}
                likesCount={reviewStats.likesCount}
                repliesCount={reviewStats.repliesCount}
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (typeM === "tv") {
    const tvRes = response as TspecifiedTv;
    const primaryGenre = tvRes.genres?.[0]?.name ?? "Unknown";
    const secondaryGenre = tvRes.genres?.[1]?.name;
    const rating =
      typeof tvRes.vote_average === "number"
        ? tvRes.vote_average.toFixed(1)
        : "--";

    const [existingLog, watchedBy] = user?.id
      ? await Promise.all([
          getLoggedMovieTv(tvRes.id, "tv"),
          getWatchedByForShow(String(tvRes.id)),
        ])
      : [null, []];

    const reviewStats = existingLog
      ? await getReviewStats(existingLog.id)
      : { likesCount: 0, repliesCount: 0 };

    return (
      <div className="mt-[32vh] flex w-[90vw] flex-col gap-4 md:mb-0 md:mt-0 md:w-full">
        <div className="flex flex-row items-start justify-between gap-8 md:flex-col md:gap-4">
          {/* ── Left: tv info ── */}
          <div className="flex min-w-0 flex-1 flex-col gap-4 md:w-full md:gap-3">
            <Badge className="w-fit bg-backgroundM px-4 text-base font-normal sm:px-2 sm:text-xs">
              TV show
            </Badge>
            <h2 className="text-5xl font-extrabold tracking-tighter text-textMain smd:text-3xl">
              {tvRes.name}
            </h2>
            <div className="flex w-fit flex-wrap gap-2 text-sm text-gray-300 smd:gap-1 smd:text-xs s:text-[10px]">
              <span>
                {tvRes.number_of_episodes} ep · {tvRes.number_of_seasons}{" "}
                {tvRes.number_of_seasons > 1 ? "seasons" : "season"}
              </span>
              <span>•</span>
              <span>{tvRes.first_air_date}</span>
              <span>•</span>
              <span>{primaryGenre}</span>
              {secondaryGenre && (
                <>
                  <span>•</span>
                  <span>{secondaryGenre}</span>
                </>
              )}
              <span>•</span>
              <span className="flex items-center gap-1">
                <StarIcon className="inline h-3.5 w-3.5 text-primaryM-400" />
                {rating}
              </span>
            </div>

            {/* ── Action buttons ── */}
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <LogTheMT
                show={tvRes}
                typeM={typeM}
                userId={user?.id}
                initialLog={existingLog}
              />
              <DrawerDialogButtonList
                userId={user?.id}
                movieId={tvRes.id}
                itemTitle={tvRes.name}
                itemPosterPath={tvRes.poster_path}
              />
              <ShareButton typeSearch="Movie" />
              <Button asChild variant="default" size="default">
                <Link href={`/player/tv/${tvRes.id}?s=1&ep=1`} className="">
                  Watch it
                </Link>
              </Button>
            </div>

            <WatchedByRow watchedBy={watchedBy} />

            {/* ── Review card: mobile only, truly full width ── */}
            {existingLog && (
              <div className="hidden md:mt-1 md:block md:w-full">
                <UserReviewPreview
                  log={existingLog}
                  username={user?.username ?? null}
                  likesCount={reviewStats.likesCount}
                  repliesCount={reviewStats.repliesCount}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* ── Right column: desktop only ── */}
          {existingLog && (
            <div className="w-[400px] shrink-0 xxl:w-[380px] xl:w-[360px] lg:w-[320px] xmd:w-[280px] md:hidden">
              <UserReviewPreview
                log={existingLog}
                username={user?.username ?? null}
                likesCount={reviewStats.likesCount}
                repliesCount={reviewStats.repliesCount}
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}
