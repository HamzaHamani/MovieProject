import { convertRuntime } from "@/lib/utils";
import { TspecifiedMovie } from "@/types/api";
import { Bookmark, Heart, Share2, Star, StarIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { ButtonAnimation } from "../ui/ButtonAnimation";
import { TspecifiedTv } from "@/types/apiTv";
import ShareButton from "./buttons/shareButton";
import WatchListButton from "./buttons/watchListButton";
import { DrawerDialogButtonList } from "./buttons/draweDialogButtonList";
import { getUser } from "@/lib/actions";
import { Separator } from "../ui/separator";
import BWCard from "./bwCard";
import LogTheMT from "./buttons/logTheMT";

type TspecifiedMedia = TspecifiedMovie | TspecifiedTv;

type Props = {
  response: TspecifiedMedia;
  typeM: "movie" | "tv";
};

export default async function FirstContainer({ response, typeM }: Props) {
  const user = await getUser();

  if (typeM === "movie") {
    const movieRes = response as TspecifiedMovie;

    const runtime = convertRuntime(movieRes.runtime);
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
            <p>{movieRes.genres[0].name}</p>

            <span>•</span>
            {movieRes.genres.length > 1 && <p>{movieRes.genres[1].name}</p>}
            <span>•</span>

            <div className="flex items-center gap-1">
              <StarIcon className="inline h-4 w-4 text-yellow-400" />
              <span className="">{movieRes.vote_average.toFixed(1)}</span>
            </div>
            <span>•</span>
            <p>{((num: number) => num.toLocaleString())(movieRes.revenue)}$</p>
          </div>
          <div className="button-left mt-3 flex gap-2">
            <LogTheMT show={response} typeM={typeM} />

            <DrawerDialogButtonList userId={user?.id} movieId={movieRes.id} />
            <ShareButton typeSearch="Movie" />
          </div>
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
            <p>{tvRes.genres[0].name}</p>
            <span>•</span>
            {tvRes.genres.length > 1 && <p>{tvRes.genres[1].name}</p>}{" "}
            <span>•</span>
            <div className="flex items-center gap-1">
              <StarIcon className="inline h-4 w-4 text-yellow-400" />
              <span className="">{tvRes.vote_average.toFixed(1)}</span>
            </div>
          </div>
          <div className="button-left mt-3 flex gap-2">
            <LogTheMT show={tvRes} typeM={typeM} />

            <DrawerDialogButtonList userId={user?.id} movieId={tvRes.id} />

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
