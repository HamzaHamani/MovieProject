import ReviewsLoadingIndicator from "./reviewsLoadingIndicator";
import WatchProvidersLoadingIndicator from "./watchProvidersLoadingIndicator";

export default function ReviewsAndProvidersLoadingIndicator() {
  return (
    <section className="grid grid-cols-12 gap-6 lg:grid-cols-1">
      <div className="col-span-8 lg:col-span-1">
        <ReviewsLoadingIndicator />
      </div>
      <div className="col-span-4 lg:col-span-1">
        <WatchProvidersLoadingIndicator />
      </div>
    </section>
  );
}
