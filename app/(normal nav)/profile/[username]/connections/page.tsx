import Link from "next/link";
import { notFound } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserConnections, getUserDbProfileByUsername } from "@/lib/actions";

type ViewKind = "followers" | "following" | "friends";

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { username } = await params;
  const { view } = await searchParams;

  const profileUser = await getUserDbProfileByUsername(username);
  if (!profileUser) notFound();

  const currentView: ViewKind =
    view === "following" || view === "friends" ? view : "followers";

  const items = await getUserConnections(profileUser.id, currentView);

  const tabs: Array<{ key: ViewKind; label: string }> = [
    { key: "followers", label: "Followers" },
    { key: "following", label: "Following" },
    { key: "friends", label: "Friends" },
  ];

  return (
    <div className="container mt-6 pb-12 text-textMain">
      <div className="mx-auto max-w-3xl space-y-4">
        <div>
          <Link
            href={`/profile/${username}`}
            className="text-sm text-primaryM-500 hover:text-primaryM-400"
          >
            Back to @{username}
          </Link>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex flex-wrap items-center gap-2">
            {tabs.map((tab) => (
              <Link
                key={tab.key}
                href={`/profile/${username}/connections?view=${tab.key}`}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  currentView === tab.key
                    ? "border-primaryM-500/60 bg-primaryM-500/15 text-primaryM-300"
                    : "border-white/15 bg-white/[0.03] text-gray-300 hover:bg-white/[0.06]"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          {items.length === 0 ? (
            <p className="text-sm text-gray-400">No accounts to show.</p>
          ) : (
            items.map((account) => {
              const displayName =
                account.name?.trim() ||
                account.username ||
                account.email ||
                "User";

              return (
                <Link
                  key={account.id}
                  href={account.username ? `/profile/${account.username}` : "#"}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 transition hover:bg-white/[0.05]"
                >
                  <Avatar className="h-11 w-11 border border-white/10 bg-black/20">
                    {account.image ? (
                      <AvatarImage src={account.image} alt={displayName} />
                    ) : null}
                    <AvatarFallback className="bg-white/10 text-xs text-white">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-gray-400">
                      {account.username
                        ? `@${account.username}`
                        : account.email ?? "No username"}
                    </p>
                  </div>
                </Link>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}
