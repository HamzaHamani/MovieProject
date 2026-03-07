import { TReviewItem } from "@/lib/actions";

type Props = {
  items: TReviewItem[];
};

export default function ReviewsSection({ items }: Props) {
  const list = items.slice(0, 6);

  return (
    <section className="mt-10">
      <h3 className="mb-5 text-3xl font-medium xl:text-2xl smd:text-xl">Reviews</h3>

      {list.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#101018] p-4 text-sm text-gray-300">
          No reviews available yet on TMDB for this title.
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((review) => (
            <article
              key={review.id}
              className="rounded-xl border border-white/10 bg-[#101018] p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <h4 className="line-clamp-1 text-sm font-semibold text-white">
                  {review.author}
                </h4>
                <div className="text-xs text-gray-400">
                  {new Date(review.created_at).toLocaleDateString()}
                </div>
              </div>

              <p className="line-clamp-4 text-sm text-gray-300">{review.content}</p>

              {typeof review.author_details?.rating === "number" && (
                <p className="mt-2 text-xs text-primaryM-400">
                  Rating: {review.author_details.rating}/10
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
