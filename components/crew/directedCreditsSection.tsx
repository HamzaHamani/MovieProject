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

export default async function DirectedCreditsSection({
  personId,
}: {
  personId: string;
}) {
  const combinedCredits = await getPersonCombinedCredits(personId);

  const directed = [...combinedCredits.crew]
    .filter(
      (credit) =>
        (credit.media_type === "movie" || credit.media_type === "tv") &&
        typeof credit.job === "string" &&
        credit.job.toLowerCase().includes("director"),
    )
    .sort((a, b) => {
      const byDate = getCreditDateValue(b) - getCreditDateValue(a);
      if (byDate !== 0) return byDate;
      return b.popularity - a.popularity;
    });

  return (
    <CreditsGridClient
      title="Directed"
      items={directed}
      emptyText="No directing credits found."
    />
  );
}
