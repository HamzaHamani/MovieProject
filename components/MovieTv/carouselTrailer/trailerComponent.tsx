import { Suspense } from "react";
import CarouselLoadingIndicator from "./CarouselLoadingIndicator";
import Trailer from "./trailer";

type Props = {
  id: any;
  typeM: "movie" | "tv";
};

export default function TrailerComponent({ id, typeM }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {" "}
      <h3 className="mb-4 text-3xl font-medium xl:text-2xl">
        Trailer / Videos
      </h3>
      <div className="bg-ed-200">
        <Suspense fallback={<CarouselLoadingIndicator />}>
          <Trailer typeM={typeM} id={id} />
        </Suspense>
      </div>
    </div>
  );
}
