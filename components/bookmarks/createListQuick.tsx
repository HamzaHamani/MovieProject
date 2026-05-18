"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, X } from "lucide-react";

import {
  showErrorNotification,
  showSuccessNotification,
} from "@/components/notificationSystem";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { AnimatedModal } from "@/components/ui/animated-modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMediaQuery } from "@/hooks/use-media-query";
import { getFriendsForCurrentUser } from "@/lib/actions";

type FriendUser = Awaited<ReturnType<typeof getFriendsForCurrentUser>>[number];

export default function CreateListQuick() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>(
    [],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const router = useRouter();

  const resetForm = () => {
    setName("");
    setDescription("");
    setIsPublic(true);
    setSelectedCollaborators([]);
  };

  const closeAndReset = () => {
    setOpen(false);
    resetForm();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetForm();
      return;
    }

    void getFriendsForCurrentUser()
      .then(setFriends)
      .catch(() => setFriends([]));
  };

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (trimmedName.length < 2) {
      showErrorNotification(
        "Invalid name",
        "List name must be at least 2 characters",
      );
      return;
    }

    if (trimmedDescription.length < 10) {
      showErrorNotification(
        "Invalid description",
        "Description must be at least 10 characters",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/bookmarks/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookmarkName: trimmedName,
          description: trimmedDescription,
          isPublic,
        }),
      });

      const json = (await response.json()) as { error?: string; id?: string };

      if (!response.ok) {
        throw new Error(json.error ?? "Could not create list");
      }

      if (json.id && selectedCollaborators.length > 0) {
        await Promise.all(
          selectedCollaborators.map((userId) =>
            fetch("/api/collaborators/manage", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "invite",
                bookmarkId: json.id,
                invitedUserId: userId,
              }),
            }),
          ),
        );
      }

      showSuccessNotification("List created", `${trimmedName} is ready`);
      closeAndReset();
      router.refresh();
    } catch (error) {
      showErrorNotification(
        "Create Error",
        error instanceof Error ? error.message : "Could not create list",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formContent = (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-3">
      <p className="text-xs uppercase tracking-[0.22em] text-gray-400">
        Create List
      </p>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Favorites from 2026"
        className="border-white/15 bg-white/5 text-white"
        required
        maxLength={60}
      />
      <Input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="A short description for this list"
        className="border-white/15 bg-white/5 text-white"
        maxLength={180}
      />

      <label className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-200">
        <span>
          <span className="block text-xs uppercase tracking-[0.2em] text-gray-400">
            Privacy
          </span>
          <span className="text-sm text-white">Make this list public</span>
        </span>
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="h-4 w-4 accent-primaryM-500"
        />
      </label>

      <div>
        <div className="mb-2">
          <span className="inline-block rounded-full bg-[#c9a227] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-black">
            Invite collaborators
          </span>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          {friends.length === 0 ? (
            <div className="rounded-lg border-dashed border-white/15 bg-transparent p-6 text-center text-xs text-gray-300">
              No friends available to invite yet.
            </div>
          ) : (
            <div className="max-h-36 space-y-2 overflow-y-auto rounded-md p-1">
              {friends.map((friend) => {
                const selected = selectedCollaborators.includes(friend.id);
                return (
                  <label
                    key={friend.id}
                    className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 hover:bg-white/[0.04]"
                  >
                    <span className="text-sm text-gray-200">
                      {friend.name ?? friend.username ?? "User"}
                      {friend.username ? (
                        <span className="ml-1 text-xs text-gray-400">
                          @{friend.username}
                        </span>
                      ) : null}
                    </span>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(event) => {
                        if (event.target.checked)
                          setSelectedCollaborators((prev) => [
                            ...prev,
                            friend.id,
                          ]);
                        else
                          setSelectedCollaborators((prev) =>
                            prev.filter((id) => id !== friend.id),
                          );
                      }}
                    />
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          className="border-white/20 bg-white/5 text-white hover:bg-white/10"
          onClick={closeAndReset}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-primaryM-500 text-black hover:bg-primaryM-600"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create list"}
        </Button>
      </div>
    </form>
  );

  if (isDesktop) {
    return (
      <>
        <Button
          type="button"
          className="bg-primaryM-500 text-black hover:bg-primaryM-600"
          onClick={() => handleOpenChange(true)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create List
        </Button>

        <AnimatedModal
          open={open}
          onClose={() => handleOpenChange(false)}
          maxWidth="760px"
          className="relative z-10 w-full overflow-hidden rounded-2xl border border-white/10 bg-backgroundM px-7 shadow-[0_24px_80px_-28px_rgba(0,0,0,0.95)]"
        >
          <span className="mb-3 mt-6 inline-block rounded-full bg-[#c9a227] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-black">
            Create List
          </span>

          <h2 className="text-xl font-medium text-white">Create a new list</h2>
          <p className="mt-1 text-sm text-white/40">
            Add a name and description, then start saving movies and TV shows.
          </p>

          <div className="mt-5 h-px w-full bg-white/10" />

          <div className="px-0 pb-3 pt-5">{formContent}</div>
        </AnimatedModal>
      </>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>
        <Button
          type="button"
          className="bg-primaryM-500 text-black hover:bg-primaryM-600"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create List
        </Button>
      </DrawerTrigger>
      <DrawerContent className="with-popup-shell max-h-[88svh] overflow-hidden border-0 bg-transparent from-transparent">
        <div className="relative rounded-xl border border-white/10 bg-backgroundM p-6">
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>

          <span className="mb-3 inline-block rounded-full bg-[#c9a227] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-black">
            Create List
          </span>

          <h2 className="text-xl font-medium text-white">Create a new list</h2>
          <p className="mt-1 text-sm text-white/40">
            Add a name and description, then start saving movies and TV shows.
          </p>

          <div className="mt-5 h-px w-full bg-white/10" />

          <div className="px-0 pb-3 pt-5">{formContent}</div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
