import { Suspense } from "react";
import Trailer from "./trailer";
import CarouselTLoadingIndicator from "./CarouseTlLoadingIndicator";

type Props = {
  id: any;
  typeM: "movie" | "tv";
};

export default function TrailerComponent({ id, typeM }: Props) {
  return (
    <section className="mt-10 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-5 xl:p-4 s:p-3">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.18em] text-primaryM-500/80">
          Watch
        </p>
        <h3 className="text-3xl font-semibold xl:text-2xl s:text-xl">
          Trailer / Videos
        </h3>
      </div>
      <div>
        <Suspense fallback={<CarouselTLoadingIndicator />}>
          <Trailer typeM={typeM} id={id} />
        </Suspense>
      </div>
    </section>
  );
}
