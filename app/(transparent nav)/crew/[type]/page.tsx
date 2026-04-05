import { getPersonDetails, getPersonImages } from "@/lib/actions";
import ActedCreditsSection from "@/components/crew/actedCreditsSection";
import BiographyText from "@/components/crew/biographyText";
import DirectedCreditsSection from "@/components/crew/directedCreditsSection";
import CreditsSectionSkeleton from "@/components/crew/creditsSectionSkeleton";
import LazyBlurImage from "@/components/ui/lazyBlurImage";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type Props = {
  params: Promise<{ type: string }>;
};

function normalizePersonId(raw: string): string | null {
  const maybeId = raw.split("-").at(-1) ?? raw;
  return /^\d+$/.test(maybeId) ? maybeId : null;
}

function formatBirthday(
  birthday: string | null,
  deathday: string | null,
): string {
  if (!birthday) return "Unknown";
  const born = new Date(birthday);
  const bornText = Number.isNaN(born.getTime())
    ? birthday
    : born.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

  if (!deathday) return bornText;

  const died = new Date(deathday);
  const diedText = Number.isNaN(died.getTime())
    ? deathday
    : died.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

  return `${bornText} - ${diedText}`;
}
export default async function Page({ params }: Props) {
  const { type } = await params;
  const personId = normalizePersonId(type);
  if (!personId) notFound();

  const [person, images] = await Promise.all([
    getPersonDetails(personId),
    getPersonImages(personId),
  ]);

  if (!person?.id) notFound();

  const imagePath = person.profile_path ?? images[0]?.file_path ?? null;

  return (
    <main className="min-h-screen bg-[#050505] pb-14 pt-24 text-white">
      <div className="mx-auto w-full max-w-7xl space-y-10 px-10 xl:px-8 lg:px-7 md:px-6 s:px-4">
        <section className="grid grid-cols-[320px_1fr] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] lg:grid-cols-[300px_1fr] md:grid-cols-1">
          <div className="relative h-full min-h-[460px] w-full overflow-hidden bg-zinc-800 lg:min-h-[430px] md:min-h-[360px]">
            {imagePath ? (
              <LazyBlurImage
                src={`https://image.tmdb.org/t/p/w780${imagePath}`}
                alt={person.name}
                className="h-full w-full object-cover"
                placeholderClassName="bg-zinc-700/50"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-sm text-zinc-400">
                No image
              </div>
            )}
          </div>

          <div className="space-y-4 p-8 lg:p-7 md:p-6 s:p-4">
            <h1 className="text-4xl font-bold lg:text-3xl md:text-2xl">
              {person.name}
            </h1>

            <div className="flex flex-wrap gap-2 text-sm text-zinc-300 md:text-xs">
              <span className="rounded-full bg-white/10 px-3 py-1">
                {person.known_for_department}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1">
                Born: {formatBirthday(person.birthday, person.deathday)}
              </span>
              {person.place_of_birth ? (
                <span className="rounded-full bg-white/10 px-3 py-1">
                  {person.place_of_birth}
                </span>
              ) : null}
            </div>

            <BiographyText
              text={
                person.biography?.trim() ||
                "No biography available for this person yet."
              }
              className="max-w-4xl leading-7 text-zinc-200 md:text-sm md:leading-6"
            />
          </div>
        </section>

        <Suspense fallback={<CreditsSectionSkeleton title="Acted In" />}>
          <ActedCreditsSection personId={personId} />
        </Suspense>

        <Suspense fallback={<CreditsSectionSkeleton title="Directed" />}>
          <DirectedCreditsSection personId={personId} />
        </Suspense>
      </div>
    </main>
  );
}
