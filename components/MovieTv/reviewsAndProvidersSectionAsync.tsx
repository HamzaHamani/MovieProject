import { getReviewsByType, getWatchProvidersByType } from "@/lib/actions";
import ReviewsSection from "./reviewsSection";
import WatchProvidersSection from "./watchProvidersSection";

type Props = {
  id: number;
  typeM: "movie" | "tv";
};

export default async function ReviewsAndProvidersSectionAsync({
  id,
  typeM,
}: Props) {
  const [reviews, providers] = await Promise.all([
    getReviewsByType(String(id), typeM),
    getWatchProvidersByType(String(id), typeM),
  ]);

  return (
    <section className="grid grid-cols-12 gap-6 lg:grid-cols-1">
      <div className="col-span-8 lg:col-span-1">
        <ReviewsSection items={reviews} />
      </div>
      <div className="col-span-4 lg:col-span-1">
        <WatchProvidersSection providers={providers} />
      </div>
    </section>
  );
}
