import { Suspense } from "react";
import Cast from "./cast";
import CarouselLoadingIndicator from "./CarouselLoadingIndicator";

type Props = {
  id: any;
  typeM: "movie" | "tv";
};

export default function CastComponent({ id, typeM }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {" "}
      <h3 className="mb-4 text-3xl font-medium xl:text-2xl">Top Cast</h3>
      <div className="bg-ed-200">
        <Suspense fallback={<CarouselLoadingIndicator />}>
          <Cast typeM={typeM} id={id} />
        </Suspense>
      </div>
    </div>
  );
}
