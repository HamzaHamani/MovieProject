import { convertRuntime } from "@/lib/utils";
import { TspecifiedMovie } from "@/types/api";
import { Share2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { ButtonAnimation } from "../ui/ButtonAnimation";
import { TspecifiedTv } from "@/types/apiTv";
import ShareButton from "./buttons/shareButton";
import WatchListButton from "./buttons/watchListButton";
import { DrawerDialogButtonList } from "./buttons/draweDialogButtonList";
import { getUser } from "@/lib/actions";

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
              <span>{movieRes.release_date}</span>
            ) : (
              <span>{movieRes.first_air_date}</span>
            )}
            <span>•</span>
            {movieRes.genres.map((genre, index) => (
              <div key={index} className="flex gap-2 smd:gap-1">
                <span key={genre.id}>{genre.name}</span>
                {index < movieRes.genres.length - 1 && <span>•</span>}
              </div>
            ))}
          </div>
          <div className="button-left mt-3 flex gap-2">
            <WatchListButton shwoId={movieRes.id} />

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
            <span>{tvRes.number_of_episodes}ep</span>
            <span>•</span>
            {/* <li className="circle">{}</li> */}

            <span>{tvRes.first_air_date}</span>

            <span>•</span>
            {tvRes.genres.map((genre, index) => (
              <div key={index} className="flex gap-2 smd:gap-1">
                <span key={genre.id}>{genre.name}</span>
                {index < tvRes.genres.length - 1 && <span>•</span>}
              </div>
            ))}
          </div>
          <div className="button-left mt-3 flex gap-2">
            <WatchListButton shwoId={tvRes.id} />
            <DrawerDialogButtonList userId={user?.id} movieId={tvRes.id} />

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
}
