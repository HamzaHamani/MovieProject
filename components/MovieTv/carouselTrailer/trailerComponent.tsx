import { Suspense } from "react";
import CarouselLoadingIndicator from "./CarouseTlLoadingIndicator";
import Trailer from "./trailer";
import CarouselTLoadingIndicator from "./CarouseTlLoadingIndicator";

type Props = {
  id: any;
  typeM: "movie" | "tv";
};

export default function TrailerComponent({ id, typeM }: Props) {
  return (
    <div className="mt-10 flex flex-col gap-4">
      {" "}
      <h3 className="mb-4 text-3xl font-medium xl:text-2xl">
        Trailer / Videos
      </h3>
      <div className="bg-ed-200">
        <Suspense fallback={<CarouselTLoadingIndicator />}>
          <Trailer typeM={typeM} id={id} />
        </Suspense>
      </div>
    </div>
  );
}
