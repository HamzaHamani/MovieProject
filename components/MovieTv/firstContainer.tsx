import { convertRuntime } from "@/lib/utils";
import { TspecifiedMovie } from "@/types/api";
import { Bookmark, PlusCircle, Share2 } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ButtonAnimation } from "../ui/ButtonAnimation";
import { TspecifiedTv } from "@/types/apiTv";
import ShareButton from "../ui/shareButton";

type TspecifiedMedia = TspecifiedMovie | TspecifiedTv;

type Props = {
  response: TspecifiedMedia;
  typeM: "movie" | "tv";
};

export default function FirstContainer({ response, typeM }: Props) {
  if (typeM === "movie") {
    const movieRes = response as TspecifiedMovie;
    const runtime = convertRuntime(movieRes.runtime);
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
          <div className="flex w-fit gap-2 text-sm text-gray-300 smd:gap-1 smd:text-xs">
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
            <Button className="flex items-center gap-2 bg-primaryM-500 text-black hover:bg-primaryM-600 xsmd:text-xs">
              {" "}
              <span className="xsmd:text-xs">
                <Bookmark />
              </span>
              Add Watchlist
            </Button>
            <Button
              variant={"outline"}
              className="flex items-center gap-2 border-gray-300 bg-transparent xsmd:text-xs"
            >
              <span>
                <PlusCircle />
              </span>{" "}
              <span className="sss:hidden">Add List</span>
            </Button>
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
      <div className="mb-7 flex w-[90vw] justify-between p-2">
        <div className="flex flex-col gap-3">
          <Badge className="mb-3 w-fit bg-backgroundM px-4 text-base">TV</Badge>
          <h2 className="text-5xl font-extrabold tracking-tighter text-textMain">
            {tvRes.name}
          </h2>
          <div className="flex w-fit gap-2 text-sm text-gray-200 smd:gap-1 smd:text-xs">
            <span>{tvRes.number_of_episodes} ep</span>
            <span>•</span>

            <span>{tvRes.first_air_date}</span>
            <span>•</span>

            {tvRes.genres.map((genre, index) => (
              <div className="flex gap-2 smd:gap-1" key={index}>
                <span key={genre.id}>{genre.name}</span>
                {index < tvRes.genres.length - 1 && <span>•</span>}
              </div>
            ))}
          </div>
          <div className="button-left mt-3 flex gap-2">
            <Button className="flex items-center gap-2 bg-primaryM-500 text-black hover:bg-primaryM-600">
              {" "}
              <span>
                <Bookmark />
              </span>
              Add Watchlist
            </Button>
            <Button
              variant={"outline"}
              className="flex items-center gap-2 bg-transparent"
            >
              <span>
                <PlusCircle />
              </span>{" "}
              Add List
            </Button>
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
