import { getReviewsByType } from "@/lib/actions";
import ReviewsSection from "./reviewsSection";

type Props = {
  id: number;
  typeM: "movie" | "tv";
};

export default async function ReviewsSectionAsync({ id, typeM }: Props) {
  const items = await getReviewsByType(String(id), typeM);
  return <ReviewsSection items={items} />;
}
