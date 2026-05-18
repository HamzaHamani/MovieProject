"use client";

import { useState, useEffect } from "react";
import { Search, UserPlus, Trash2, UserRoundCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Using a custom modal design for manage collaborators (replaces Dialog/Drawer)
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { AnimatedModal } from "@/components/ui/animated-modal";
import InviteCollaboratorsModal from "@/components/bookmarks/inviteCollaborators";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  inviteCollaborator,
  removeCollaborator,
  getListCollaborators,
  getFriendsForCurrentUser,
} from "@/lib/actions";
import {
  showSuccessNotification,
  showErrorNotification,
} from "@/components/notificationSystem";

type Collaborator = Awaited<ReturnType<typeof getListCollaborators>>[number];
type FriendUser = Awaited<ReturnType<typeof getFriendsForCurrentUser>>[number];

type Props = {
  bookmarkId: string;
  isOwner: boolean;
};

export default function ListCollaboratorsManager({
  bookmarkId,
  isOwner,
}: Props) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [mutualFriends, setMutualFriends] = useState<FriendUser[]>([]);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    if (!isManageOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isManageOpen]);

  useEffect(() => {
    loadCollaborators();
  }, [bookmarkId]);

  const loadCollaborators = async () => {
    try {
      const [collabs, friends] = await Promise.all([
        getListCollaborators(bookmarkId),
        getFriendsForCurrentUser(),
      ]);
      setCollaborators(collabs);
      setMutualFriends(friends);
    } catch (error) {
      console.error("Failed to load collaborators:", error);
    }
  };

  const handleInviteCollaborator = async (userId: string) => {
    setIsLoading(true);
    try {
      const result = await inviteCollaborator(bookmarkId, userId);
      if (result.success) {
        showSuccessNotification("Collaborator invited successfully");
        loadCollaborators();
        setSearchQuery("");
      } else {
        showErrorNotification(result.error || "Failed to invite collaborator");
      }
    } catch (error) {
      showErrorNotification("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    if (!isOwner) {
      showErrorNotification("Only list owner can remove collaborators");
      return;
    }

    try {
      setRemovingUserId(userId);
      const result = await removeCollaborator(bookmarkId, userId);
      if (result.success) {
        showSuccessNotification("Collaborator removed");
        await loadCollaborators();
      } else {
        showErrorNotification(result.error || "Failed to remove collaborator");
      }
    } catch (error) {
      showErrorNotification("Something went wrong");
    } finally {
      setRemovingUserId(null);
    }
  };

  const filteredFriends = mutualFriends.filter((friend) => {
    const needle = searchQuery.trim().toLowerCase();
    if (!needle) return true;

    return [friend.name, friend.username]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(needle));
  });

  const collaboratorStateByUserId = new Map(
    collaborators
      .filter((collab) => Boolean(collab.userId))
      .map((collab) => [collab.userId as string, collab.status] as const),
  );

  const inviteContent = (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input
          placeholder="Search friends..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 border-white/15 bg-white/5 pl-8 text-sm text-white placeholder:text-gray-500"
        />
      </div>

      <p className="mt-2 text-[11px] text-gray-400">
        Only mutual friends can be invited.
      </p>

      <div className="hide-scrollbar mt-3 max-h-[55vh] space-y-2 overflow-y-auto overflow-x-hidden pr-1">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-gray-400">
          <span>Friends</span>
          <span>{filteredFriends.length}</span>
        </div>

        <div className="space-y-2">
          {filteredFriends.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.02] p-3 text-xs text-gray-300">
              No friends to invite yet
            </div>
          ) : (
            filteredFriends.map((friend) => {
              const collaboratorStatus = collaboratorStateByUserId.get(
                friend.id,
              );
              const isPending = collaboratorStatus === "pending";
              const isJoined = collaboratorStatus === "accepted";
              const isActionDisabled = isPending || isJoined || isLoading;

              return (
                <div
                  key={friend.id}
                  className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-2"
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={friend.image ?? undefined} />
                    <AvatarFallback className="bg-white/10 text-xs text-white">
                      {friend.name?.slice(0, 2)?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 text-left">
                    <p className="block w-full truncate pr-2 text-sm font-medium text-white">
                      {friend.name ?? friend.username ?? "User"}
                    </p>
                    <p className="text-xs text-gray-400">
                      @{friend.username ?? "unknown"}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleInviteCollaborator(friend.id)}
                    disabled={isActionDisabled}
                    className={`h-8 shrink-0 justify-self-end px-2 text-xs ${
                      isJoined
                        ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/15"
                        : isPending
                          ? "bg-yellow-500/12 hover:bg-yellow-500/12 border border-yellow-500/35 text-yellow-300"
                          : "bg-primaryM-500 text-black hover:bg-primaryM-600"
                    }`}
                  >
                    {isJoined ? "Joined" : isPending ? "Pending" : "Invite"}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  const manageContent = (
    <>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
          Collaborators
        </p>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-gray-300">
          {collaborators.length}
        </span>
      </div>

      {collaborators.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.02] p-3 text-xs text-gray-300">
          No collaborators yet.
        </div>
      ) : (
        <div className="hide-scrollbar max-h-[55vh] space-y-2 overflow-y-auto overflow-x-hidden pr-1">
          {collaborators.map((collab) => (
            <div
              key={collab.id}
              className="flex cursor-pointer items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-3"
            >
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src={collab.userImage ?? undefined} />
                <AvatarFallback className="bg-white/10 text-xs text-white">
                  {collab.userName?.slice(0, 2)?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <p className="text-sm font-medium text-white">
                  {collab.userName ?? collab.userUsername ?? "User"}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  @{collab.userUsername}
                </p>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <span
                  className={`text-xs font-medium ${collab.status === "accepted" ? "text-green-400" : "text-yellow-400"}`}
                >
                  {collab.status === "accepted" ? "Accepted" : "Pending"}
                </span>

                <Button
                  size="sm"
                  variant="ghost"
                  disabled={removingUserId === collab.userId}
                  onClick={(e) => {
                    e.stopPropagation();
                    collab.userId && handleRemoveCollaborator(collab.userId);
                  }}
                  className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-400"
                  title="Remove collaborator"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isOwner ? (
        <InviteCollaboratorsModal
          bookmarkId={bookmarkId}
          onInvited={loadCollaborators}
        />
      ) : (
        <Button
          type="button"
          className="h-8 gap-2 border border-white/20 bg-white/[0.04] px-3 text-xs text-white hover:bg-white/10"
          disabled
          title="Only owner can invite"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Invite Collaborators
        </Button>
      )}

      {isOwner ? (
        <>
          {isDesktop ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsManageOpen(true)}
                className="h-8 w-8 border-white/20 bg-white/[0.04] p-0 text-white hover:bg-white/10"
                title="Manage collaborators"
              >
                <UserRoundCog className="h-4 w-4" />
              </Button>

              <AnimatedModal
                open={isManageOpen}
                onClose={() => setIsManageOpen(false)}
                maxWidth="760px"
                className="relative z-10 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0ed1] shadow-[0_24px_80px_-28px_rgba(0,0,0,0.95)]"
              >
                <span className="mb-3 mt-6 inline-block rounded-full bg-[#c9a227] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-black">
                  Manage Collaborators
                </span>

                <h2 className="text-xl font-medium text-white">
                  Manage Collaborators
                </h2>
                <p className="mt-1 text-sm text-white/40">
                  View all collaborators and remove selected users from this
                  list.
                </p>

                <div className="mt-5 h-px w-full bg-white/10" />

                <div className="mt-4">{manageContent}</div>
              </AnimatedModal>
            </>
          ) : (
            <Drawer open={isManageOpen} onOpenChange={setIsManageOpen}>
              <DrawerTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 w-8 border-white/20 bg-white/[0.04] p-0 text-white hover:bg-white/10"
                  title="Manage collaborators"
                >
                  <UserRoundCog className="h-4 w-4" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="max-h-[88svh] overflow-hidden border border-white/20 bg-[#0a0a0ed1] shadow-[0_24px_80px_-28px_rgba(0,0,0,0.95)] backdrop-blur-xl">
                <div className="relative rounded-xl border border-white/10 bg-[#0a0a0ed1] p-6">
                  <button
                    type="button"
                    onClick={() => setIsManageOpen(false)}
                    aria-label="Close"
                    className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition hover:bg-white/10 hover:text-white"
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>

                  <span className="mb-3 inline-block rounded-full bg-[#c9a227] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-black">
                    Manage Collaborators
                  </span>

                  <h2 className="text-xl font-medium text-white">
                    Manage Collaborators
                  </h2>
                  <p className="mt-1 text-sm text-white/40">
                    View all collaborators and remove selected users from this
                    list.
                  </p>

                  <div className="mt-5 h-px w-full bg-white/10" />

                  <div className="mt-4">{manageContent}</div>
                </div>
              </DrawerContent>
            </Drawer>
          )}
        </>
      ) : null}
    </div>
  );
}
