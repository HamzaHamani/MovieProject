import { getCreditsTVMovie } from "@/lib/actions";
import CastComponent from "./castComponent";

type Props = {
  typeM: "movie" | "tv";
  id: any;
};

export default async function Cast({ typeM, id }: Props) {
  if (typeM === "movie") {
    try {
      const res = await getCreditsTVMovie(id, "movie");
      console.log(res);
      return <CastComponent res={res} />;
    } catch (e) {
      throw new Error("we couldnt fetch the data about the casts");
    }
  }
  if (typeM === "tv") {
    try {
      const res = await getCreditsTVMovie(id, "tv");
      console.log(res);
    } catch (e) {
      throw new Error("we couldnt fetch the data about the casts");
    }
  }
}
