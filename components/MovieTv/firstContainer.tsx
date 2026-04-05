import { convertRuntime } from "@/lib/utils";
import { TspecifiedMovie } from "@/types/api";
import { Bookmark, Heart, Share2, Star, StarIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { ButtonAnimation } from "../ui/ButtonAnimation";
import { TspecifiedTv } from "@/types/apiTv";
import ShareButton from "./buttons/shareButton";
import WatchListButton from "./buttons/watchListButton";
import { DrawerDialogButtonList } from "./buttons/draweDialogButtonList";
import { getLoggedMovieTv, getUser, getWatchedByForShow } from "@/lib/actions";
import { Separator } from "../ui/separator";
import BWCard from "./bwCard";
import LogTheMT from "./buttons/logTheMT";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";

type TspecifiedMedia = TspecifiedMovie | TspecifiedTv;

type Props = {
  response: TspecifiedMedia;
  typeM: "movie" | "tv";
};

export default async function FirstContainer({ response, typeM }: Props) {
  const user = await getUser();

  const getInitials = (label: string) => {
    const parts = label.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  };

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
        ? `${movieRes.revenue.toLocaleString()}$`
        : "--";

    const runtime = convertRuntime(movieRes.runtime);
    const [existingLog, watchedBy] = user?.id
      ? await Promise.all([
          getLoggedMovieTv(movieRes.id),
          getWatchedByForShow(String(movieRes.id)),
        ])
      : [null, []];
    // TODO FIX WACHLIST BUTTON AND ADD LIST SIZE IN MOBILE , AND CATEGORIES IN CERTAIN MOBILES THEY COLAPSE AND ALSO THE TOAST LOOKS BIG ON THE MOBILE

    return (
      <div className="mb-2 flex w-[90vw] justify-between md:mb-0">
        <div className="flex flex-col gap-3">
          <Badge className="mb-3 w-fit bg-backgroundM px-4 text-base font-normal sm:px-2 sm:text-xs">
            Movie
          </Badge>
          <h2 className="text-5xl font-extrabold tracking-tighter text-textMain">
            {movieRes.title}
          </h2>
          {/* TODO, IN CASE OF USING UL LIST, JUST NORMAL P TAG, WITH SPANS INSIDE IT THEN SPERATE WITH GAP FLEX AND ADD DOTS UR SLEF WITHOUT ANY STYLING */}
          <div className="flex w-fit gap-2 text-sm text-gray-300 smd:gap-1 smd:text-xs s:text-[10px] xss:text-[8px]">
            <span>{runtime}</span>
            <span>•</span>
            {/* <li className="circle">{}</li> */}
            {typeM === "movie" ? (
              <p>{movieRes.release_date}</p>
            ) : (
              <p>{movieRes.first_air_date}</p>
            )}
            <span>•</span>
            <p>{primaryGenre}</p>

            <span>•</span>
            {secondaryGenre && <p>{secondaryGenre}</p>}
            <span>•</span>

            <div className="flex items-center gap-1">
              <StarIcon className="inline h-4 w-4 text-yellow-400" />
              <span className="">{rating}</span>
            </div>
            <span>•</span>
            <p>{revenueLabel}</p>
          </div>
          <div className="button-left mt-3 flex gap-2">
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
          </div>

          {watchedBy.length > 0 ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-xs uppercase tracking-[0.22em] text-gray-400">
                Watched by
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {watchedBy.slice(0, 8).map((item) => {
                  const display = item.username || item.name || "User";
                  const ratingLabel =
                    typeof item.rating === "number"
                      ? `${item.rating.toFixed(1)} ★`
                      : "No rating";
                  const relationLabel =
                    item.source === "friend" ? "Friend" : "Following";

                  const content = (
                    <div className="min-w-[128px] rounded-xl border border-white/10 bg-black/30 p-2.5 transition hover:border-primaryM-500/35 hover:bg-black/40">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7 border border-white/10">
                          <AvatarImage
                            src={item.image ?? undefined}
                            alt={display}
                          />
                          <AvatarFallback className="bg-white/10 text-[10px] text-white">
                            {getInitials(display)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="line-clamp-1 text-sm font-medium text-white">
                          @{display}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-gray-300">
                        {ratingLabel}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                        {relationLabel}
                      </p>
                    </div>
                  );

                  return item.username ? (
                    <Link key={item.userId} href={`/profile/${item.username}`}>
                      {content}
                    </Link>
                  ) : (
                    <div key={item.userId}>{content}</div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
        <div className="shareR self-end">
          {" "}
          {/* add button animation from that  website */}
          <ButtonAnimation
            typeSearch="Movie"
            text="Share"
            icon={<Share2 className="h-4 w-4" />}
            afterText="Shared"
          />
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
    const existingLog = user?.id ? await getLoggedMovieTv(tvRes.id) : null;

    return (
      <div className="mb-2 flex w-[90vw] justify-between md:mb-0">
        <div className="flex flex-col gap-3">
          <Badge className="mb-3 w-fit bg-backgroundM px-4 text-base font-normal sm:px-2 sm:text-xs">
            TV show
          </Badge>
          <h2 className="text-5xl font-extrabold tracking-tighter text-textMain">
            {tvRes.name}
          </h2>
          {/* TODO, IN CASE OF USING UL LIST, JUST NORMAL P TAG, WITH SPANS INSIDE IT THEN SPERATE WITH GAP FLEX AND ADD DOTS UR SLEF WITHOUT ANY STYLING */}
          <div className="flex w-fit gap-2 text-sm text-gray-300 smd:gap-1 smd:text-xs s:text-[10px] xss:text-[8px]">
            <p>
              {tvRes.number_of_episodes} ep - {tvRes.number_of_seasons}{" "}
              {tvRes.number_of_seasons > 1 ? "seasons" : "season"}
            </p>
            <span>•</span>
            {/* <li className="circle">{}</li> */}
            <p>{tvRes.first_air_date}</p>
            <span>•</span>
            <p>{primaryGenre}</p>
            <span>•</span>
            {secondaryGenre && <p>{secondaryGenre}</p>} <span>•</span>
            <div className="flex items-center gap-1">
              <StarIcon className="inline h-4 w-4 text-yellow-400" />
              <span className="">{rating}</span>
            </div>
          </div>
          <div className="button-left mt-3 flex gap-2">
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
          </div>
        </div>
        <div className="shareR self-end">
          <ButtonAnimation
            typeSearch="Movie"
            text="Share"
            icon={<Share2 className="h-4 w-4" />}
            afterText="Shared"
          />
        </div>
      </div>
    );
  }
}
