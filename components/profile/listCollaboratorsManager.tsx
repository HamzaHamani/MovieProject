"use client";

import { useState, useEffect } from "react";
import { Search, UserPlus, Trash2, UserRoundCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
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
              const collaboratorStatus = collaboratorStateByUserId.get(friend.id);
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
                    <p className="text-xs text-gray-400">@{friend.username ?? "unknown"}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleInviteCollaborator(friend.id)}
                    disabled={isActionDisabled}
                    className={`h-8 shrink-0 justify-self-end px-2 text-xs ${
                      isJoined
                        ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/15"
                        : isPending
                          ? "border border-yellow-500/35 bg-yellow-500/12 text-yellow-300 hover:bg-yellow-500/12"
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
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
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
              className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-2"
            >
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={collab.userImage ?? undefined} />
                <AvatarFallback className="bg-white/10 text-xs text-white">
                  {collab.userName?.slice(0, 2)?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 text-left">
                <p className="block w-full truncate pr-2 text-sm font-medium text-white">
                  {collab.userName ?? collab.userUsername ?? "User"}
                </p>
                <p className="text-xs text-gray-400">@{collab.userUsername}</p>
              </div>
              <div className="flex items-center gap-2 justify-self-end">
                <span
                  className={`text-xs font-medium ${
                    collab.status === "accepted"
                      ? "text-green-400"
                      : "text-yellow-400"
                  }`}
                >
                  {collab.status === "accepted" ? "Accepted" : "Pending"}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={removingUserId === collab.userId}
                  onClick={() => collab.userId && handleRemoveCollaborator(collab.userId)}
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
    </div>
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            className="h-8 gap-2 border border-white/20 bg-white/[0.04] px-3 text-xs text-white hover:bg-white/10"
            disabled={!isOwner}
            title={isOwner ? "Invite collaborators" : "Only owner can invite"}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Invite Collaborators
          </Button>
        </DialogTrigger>

        <DialogContent className="max-h-[88svh] w-[min(760px,94vw)] overflow-hidden border-white/10 bg-[radial-gradient(circle_at_top,_rgba(234,179,8,0.14),transparent_45%),linear-gradient(180deg,rgba(12,12,12,0.96)_0%,rgba(8,8,8,0.96)_100%)] p-5 text-textMain">
          <DialogHeader className="pb-1">
            <DialogTitle className="text-white">Invite Collaborators</DialogTitle>
            <DialogDescription className="text-gray-300">
              Invite friends to collaborate on this list. They can add or remove
              movies, but cannot delete the list or change its details.
            </DialogDescription>
          </DialogHeader>
          {inviteContent}
        </DialogContent>
      </Dialog>

      {isOwner ? (
        isDesktop ? (
          <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-8 w-8 border-white/20 bg-white/[0.04] p-0 text-white hover:bg-white/10"
                title="Manage collaborators"
              >
                <UserRoundCog className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[88svh] w-[min(760px,94vw)] overflow-hidden border-white/10 bg-[radial-gradient(circle_at_top,_rgba(234,179,8,0.14),transparent_45%),linear-gradient(180deg,rgba(12,12,12,0.96)_0%,rgba(8,8,8,0.96)_100%)] p-5 text-textMain">
              <DialogHeader className="pb-1">
                <DialogTitle className="text-white">Manage Collaborators</DialogTitle>
                <DialogDescription className="text-gray-300">
                  View all collaborators and remove selected users from this list.
                </DialogDescription>
              </DialogHeader>
              {manageContent}
            </DialogContent>
          </Dialog>
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
            <DrawerContent className="max-h-[88svh] overflow-hidden border-white/10 bg-[radial-gradient(circle_at_top,_rgba(234,179,8,0.14),transparent_45%),linear-gradient(180deg,rgba(12,12,12,0.96)_0%,rgba(8,8,8,0.96)_100%)] px-4 text-textMain">
              <DrawerHeader className="px-0 pb-2 pt-2 text-left">
                <DrawerTitle className="text-white">Manage Collaborators</DrawerTitle>
                <DrawerDescription className="text-gray-300">
                  View all collaborators and remove selected users from this list.
                </DrawerDescription>
              </DrawerHeader>
              <div className="min-h-0 overflow-y-auto overscroll-contain pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                {manageContent}
              </div>
            </DrawerContent>
          </Drawer>
        )
      ) : null}
    </div>
  );
}
