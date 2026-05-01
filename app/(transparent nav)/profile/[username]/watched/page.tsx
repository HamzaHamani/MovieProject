import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getUserDbProfileByUsername, getUser } from "@/lib/actions";
import { WatchedMediaGrid } from "@/components/profile/watchedMediaGrid";
import Link from "next/link";
import { ArrowLeft, Clock3 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Watched Media",
};

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ filter?: string }>;
}

export default async function WatchedPage({ params, searchParams }: Props) {
  const { username: usernameParam } = await params;
  const { filter } = await searchParams;

  const profileUser = await getUserDbProfileByUsername(usernameParam);
  if (!profileUser) notFound();

  const viewer = await getUser();
  const isOwner = viewer?.id === profileUser.id;

  const validFilter = filter === "movie" || filter === "tv" ? filter : "all";

  return (
    <div className="relative min-h-screen text-textMain">
      <div className="container relative z-10 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <Link
              href={`/profile/${usernameParam}`}
              className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-gray-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to profile
            </Link>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock3 className="h-6 w-6 text-primaryM-500" />
                <h1 className="text-4xl font-semibold text-white lg:text-3xl sm:text-2xl">
                  {profileUser.name ?? profileUser.username ?? "User"}'s Watched
                  Media
                </h1>
              </div>
              <p className="text-sm text-gray-400">
                All movies and TV shows they've logged and watched
              </p>
            </div>
          </div>

          <Separator className="bg-white/10" />

          {/* Watched Media Grid */}
          <WatchedMediaGrid
            userId={profileUser.id}
            initialFilter={validFilter as any}
          />
        </div>
      </div>
    </div>
  );
}
