import { getSpecifiedTVMovieVideos } from "@/lib/actions";
import { CarouselComponent } from "./carouselComponent";

type Props = {
  typeM: "movie" | "tv";
  id: any;
};

export default async function Trailer({ typeM, id }: Props) {
  if (typeM === "movie") {
    try {
      const res = await getSpecifiedTVMovieVideos(id, "movie");
      return <CarouselComponent res={res} />;
    } catch (e) {
      throw new Error("we couldnt fetch the data about the casts");
    }
  }

  if (typeM === "tv") {
    try {
      const res = await getSpecifiedTVMovieVideos(id, "tv");
      return <CarouselComponent res={res} />;
    } catch (e) {
      throw new Error("we couldnt fetch the data about the casts");
    }
  }

  return null;
}
