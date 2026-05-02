import { getCreditsTVMovie } from "@/lib/actions";
import { CarouselComponent } from "./carouselComponent";
import { delay } from "@/lib/utils";

type Props = {
  typeM: "movie" | "tv";
  id: any;
};

export default async function Cast({ typeM, id }: Props) {
  // console.log(id);
  const highlightCrewJobs = new Set([
    "Director",
    "Writer",
    "Screenplay",
    "Story",
    "Creator",
    "Executive Producer",
    "Producer",
  ]);

  function buildFilmmakers(
    crew: Awaited<ReturnType<typeof getCreditsTVMovie>>["crew"],
  ) {
    const grouped = new Map<
      number,
      {
        id: number;
        name: string;
        profile_path: string | null;
        roles: string[];
        rank: number;
      }
    >();

    crew.forEach((member) => {
      const isKeyCrew =
        highlightCrewJobs.has(member.job) ||
        member.department === "Directing" ||
        member.department === "Writing" ||
        member.department === "Production";

      if (!isKeyCrew) return;

      const role = member.job || member.department;
      const rank =
        (member.job === "Director" ? 0 : 1) +
        (member.department === "Directing" ? 0 : 2) +
        (member.department === "Writing" ? 1 : 0);

      const existing = grouped.get(member.id);
      if (existing) {
        if (!existing.roles.includes(role)) {
          existing.roles.push(role);
        }
        existing.rank = Math.min(existing.rank, rank);
        return;
      }

      grouped.set(member.id, {
        id: member.id,
        name: member.name,
        profile_path: member.profile_path,
        roles: [role],
        rank,
      });
    });

    return Array.from(grouped.values())
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 8)
      .map((person) => ({
        id: person.id,
        name: person.name,
        profile_path: person.profile_path,
        subtitle: person.roles.join(" · "),
      }));
  }

  function buildActors(
    cast: Awaited<ReturnType<typeof getCreditsTVMovie>>["cast"],
  ) {
    return [...cast]
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 10)
      .map((person) => ({
        id: person.id,
        name: person.name,
        profile_path: person.profile_path,
        subtitle: person.character
          ? `as ${person.character}`
          : person.original_name,
      }));
  }

  if (typeM === "movie") {
    try {
      // await delay(2000);
      const res = await getCreditsTVMovie(id, "movie");
      return (
        <div className="space-y-8">
          <CarouselComponent
            title="Lead Cast"
            subtitle="Top billed performances"
            people={buildActors(res.cast)}
            variant="cast"
          />
          <CarouselComponent
            title="Creative Team"
            subtitle="Director, writers, producers and other key crew"
            people={buildFilmmakers(res.crew)}
            variant="crew"
          />
        </div>
      );
    } catch (e) {
      throw new Error("we couldnt fetch the data about the casts");
    }
  }
  if (typeM === "tv") {
    try {
      // await delay(21000);
      const res = await getCreditsTVMovie(id, "tv");
      return (
        <div className="space-y-8">
          <CarouselComponent
            title="Lead Cast"
            subtitle="Top billed performances"
            people={buildActors(res.cast)}
            variant="cast"
          />
          <CarouselComponent
            title="Creative Team"
            subtitle="Director, writers, producers and other key crew"
            people={buildFilmmakers(res.crew)}
            variant="crew"
          />
        </div>
      );
    } catch (e) {
      throw new Error("we couldnt fetch the data about the casts");
    }
  }
}
