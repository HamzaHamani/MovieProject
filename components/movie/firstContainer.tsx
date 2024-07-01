import { convertRuntime } from "@/lib/utils";
import { TspecifiedMovie } from "@/types/api";
import { Bookmark, PlusCircle, Share2 } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ButtonAnimation } from "../ui/ButtonAnimation";

type Props = {
  response: TspecifiedMovie;
};

export default function FirstContainer({ response }: Props) {
  const runtime = convertRuntime(response.runtime);

  return (
    <>
      <div className="flex w-[90vw] justify-between p-2">
        <div className="flex flex-col gap-3">
          <Badge className="mb-3 w-fit bg-backgroundM px-4 text-base">
            Movie
          </Badge>
          <h2 className="text-5xl font-extrabold tracking-tighter text-textMain">
            {response.title}
          </h2>
          <ul className="flex w-fit gap-2 text-sm text-gray-200">
            <li>{runtime}</li>
            {/* <li className="circle">{}</li> */}
            <li>{response.release_date}</li>
            {response.genres.map((genre) => (
              <li key={genre.id}>{genre.name}</li>
            ))}
          </ul>
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
    </>
  );
}
