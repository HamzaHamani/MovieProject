import { getCreditsTVMovie } from "@/lib/actions";
import { CarouselComponent } from "./carouselComponent";
import { delay } from "@/lib/utils";

type Props = {
  typeM: "movie" | "tv";
  id: any;
};

export default async function Cast({ typeM, id }: Props) {
  // console.log(id);
  if (typeM === "movie") {
    try {
      // await delay(2000);
      const res = await getCreditsTVMovie(id, "movie");
      return <CarouselComponent res={res} />;
    } catch (e) {
      throw new Error("we couldnt fetch the data about the casts");
    }
  }
  if (typeM === "tv") {
    try {
      // await delay(21000);
      const res = await getCreditsTVMovie(id, "tv");
      return <CarouselComponent res={res} />;
    } catch (e) {
      throw new Error("we couldnt fetch the data about the casts");
    }
  }
}
