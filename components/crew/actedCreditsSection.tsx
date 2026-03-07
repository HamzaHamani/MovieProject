import { getPersonCombinedCredits } from "@/lib/actions";
import CreditsGridClient from "./creditsGridClient";

function getCreditDateValue(item: {
  release_date?: string;
  first_air_date?: string;
}): number {
  const date = item.release_date ?? item.first_air_date;
  if (!date) return 0;
  const time = new Date(date).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export default async function ActedCreditsSection({
  personId,
}: {
  personId: string;
}) {
  const combinedCredits = await getPersonCombinedCredits(personId);

  const actedIn = [...combinedCredits.cast]
    .filter(
      (credit) => credit.media_type === "movie" || credit.media_type === "tv",
    )
    .sort((a, b) => {
      const byDate = getCreditDateValue(b) - getCreditDateValue(a);
      if (byDate !== 0) return byDate;
      return b.popularity - a.popularity;
    });

  return (
    <CreditsGridClient
      title="Acted In"
      items={actedIn}
      emptyText="No acting credits found."
    />
  );
}
