"use client";

import { useState, useEffect } from "react";
import { UserPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
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
  const [loadingCollaborators, setLoadingCollaborators] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    loadCollaborators();
  }, [bookmarkId]);

  const loadCollaborators = async () => {
    setLoadingCollaborators(true);
    try {
      const [collabs, friends] = await Promise.all([
        getListCollaborators(bookmarkId),
        getFriendsForCurrentUser(),
      ]);
      setCollaborators(collabs);
      setMutualFriends(friends);
    } catch (error) {
      console.error("Failed to load collaborators:", error);
    } finally {
      setLoadingCollaborators(false);
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
    </div>
  );
}
