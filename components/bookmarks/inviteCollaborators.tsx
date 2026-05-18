"use client";

import { useEffect, useState } from "react";
import { X, Trash2, UserRoundCog } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { AnimatedModal } from "@/components/ui/animated-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

import {
  showErrorNotification,
  showSuccessNotification,
} from "@/components/notificationSystem";
import { Button } from "@/components/ui/button";
import {
  getFriendsForCurrentUser,
  getListCollaborators,
  removeCollaborator,
} from "@/lib/actions";

type FriendUser = Awaited<ReturnType<typeof getFriendsForCurrentUser>>[number];

export default function InviteCollaboratorsModal({
  bookmarkId,
  onInvited,
}: {
  bookmarkId: string;
  onInvited?: () => void;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = useState(false);
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    void Promise.all([
      getFriendsForCurrentUser(),
      getListCollaborators(bookmarkId),
    ])
      .then(([friendsList, collaborators]) => {
        setFriends(friendsList ?? []);
        const accepted = new Set<string>();
        const pending = new Set<string>();
        (collaborators ?? []).forEach((c: any) => {
          if (c?.userId) {
            if (c.status === "accepted") accepted.add(String(c.userId));
            if (c.status === "pending") pending.add(String(c.userId));
          }
        });
        setAcceptedIds(accepted);
        setPendingIds(pending);
        // pre-select pending invites so they're shown checked and can be unchecked to cancel
        setSelected(Array.from(pending));
      })
      .catch(() => {
        setFriends([]);
        setAcceptedIds(new Set());
      })
      .finally(() => setLoading(false));
  }, [open]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const exists = prev.includes(id);
      // if this id is pending and we're unchecking it, cancel the invite immediately
      if (exists && pendingIds.has(id)) {
        (async () => {
          try {
            await removeCollaborator(bookmarkId, id);
            showSuccessNotification(
              "Invite cancelled",
              "Pending invite removed",
            );
            setPendingIds((s) => {
              const next = new Set(s);
              next.delete(id);
              return next;
            });
          } catch (err) {
            showErrorNotification(
              "Cancel Error",
              err instanceof Error ? err.message : "Could not cancel invite",
            );
          }
        })();
      }

      return exists ? prev.filter((p) => p !== id) : [...prev, id];
    });
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleRemoveFromList = async (userId: string) => {
    setDeletingId(userId);
    try {
      const res = await removeCollaborator(bookmarkId, userId);
      // removeCollaborator returns { success }
      if ((res as any)?.success === false) {
        showErrorNotification(
          "Remove Error",
          (res as any).error || "Could not remove user",
        );
      } else {
        // update local states
        setAcceptedIds((s) => {
          const next = new Set(s);
          next.delete(userId);
          return next;
        });
        setPendingIds((s) => {
          const next = new Set(s);
          next.delete(userId);
          return next;
        });
        setSelected((s) => s.filter((id) => id !== userId));
        showSuccessNotification("Removed", "User removed from collaborators");
        onInvited?.();
      }
    } catch (err) {
      showErrorNotification(
        "Remove Error",
        err instanceof Error ? err.message : "Could not remove user",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleInvite = async () => {
    const toInvite = selected.filter(
      (id) => !acceptedIds.has(id) && !pendingIds.has(id),
    );
    if (toInvite.length === 0) return;
    setSubmitting(true);
    try {
      await Promise.all(
        toInvite.map((userId) =>
          fetch("/api/collaborators/manage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "invite",
              bookmarkId,
              invitedUserId: userId,
            }),
          }).then(async (res) => {
            if (!res.ok)
              throw new Error((await res.json()).error ?? "Invite failed");
            return res.json();
          }),
        ),
      );

      showSuccessNotification("Invited", "Collaborators invited successfully");
      setOpen(false);
      setSelected([]);
      onInvited?.();
    } catch (err) {
      showErrorNotification(
        "Invite Error",
        err instanceof Error ? err.message : "Could not invite collaborators",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {isDesktop ? (
        <>
          <Button
            type="button"
            className="h-8 border border-white/20 bg-white/[0.04] text-xs text-white hover:bg-white/10"
            onClick={() => setOpen(true)}
          >
            <span>
              <UserRoundCog className="h-4 w-4" />
            </span>
            Manage collaborators
          </Button>

          <AnimatedModal
            open={open}
            onClose={() => setOpen(false)}
            maxWidth="640px"
            className="relative z-10 w-full overflow-hidden rounded-2xl border border-white/10 bg-backgroundM px-7 shadow-[0_24px_80px_-28px_rgba(0,0,0,0.95)]"
          >
            <span className="mb-3 mt-6 inline-block rounded-full bg-[#c9a227] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-black">
              Manage collaborators
            </span>

            <h2 className="text-xl font-medium text-white">
              Manage collaborators
            </h2>
            <p className="mt-1 text-sm text-white/40">
              View and manage collaborators for this list. Invite, cancel
              pending invites, or remove existing collaborators.
            </p>

            <div className="mt-5 h-px w-full bg-white/10" />

            <div className="mt-4 space-y-3">
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <div
                      key={`skeleton-${idx}`}
                      className="flex items-center gap-4 rounded-xl p-3"
                    >
                      <Skeleton className="h-9 w-9 rounded-md bg-white/10" />
                      <div className="min-w-0 flex-1">
                        <Skeleton className="mb-2 h-4 w-32 bg-white/10" />
                        <Skeleton className="h-3 w-20 bg-white/10" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : friends.length === 0 ? (
                <div className="rounded-lg border-dashed border-white/15 bg-transparent p-6 text-center text-xs text-gray-300">
                  No friends available to invite.
                </div>
              ) : (
                <div className="max-h-56 overflow-y-auto rounded-md p-1">
                  {friends.map((f) => (
                    <div
                      key={f.id}
                      role="button"
                      tabIndex={0}
                      aria-pressed={selected.includes(f.id)}
                      onClick={() => {
                        if (!acceptedIds.has(f.id)) toggle(f.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          if (!acceptedIds.has(f.id)) toggle(f.id);
                        }
                      }}
                      className="flex cursor-pointer items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarImage src={f.image ?? undefined} />
                          <AvatarFallback className="bg-white/10 text-xs text-white">
                            {f.name?.slice(0, 2)?.toUpperCase() ?? "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="flex items-center gap-2 text-sm font-medium text-white">
                            <span className="truncate">
                              {f.name ?? f.username ?? "User"}
                            </span>
                            {acceptedIds.has(f.id) ? (
                              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                                Joined
                              </span>
                            ) : pendingIds.has(f.id) ? (
                              <span className="bg-yellow-500/12 rounded-full px-2 py-0.5 text-[11px] font-medium text-yellow-300">
                                Pending
                              </span>
                            ) : null}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            @{f.username ?? "unknown"}
                          </p>
                        </div>
                      </div>

                      <div className="ml-auto flex items-center gap-3">
                        <input
                          aria-label={`Invite ${f.name ?? f.username}`}
                          type="checkbox"
                          checked={
                            acceptedIds.has(f.id) || selected.includes(f.id)
                          }
                          onChange={() => {
                            if (!acceptedIds.has(f.id)) toggle(f.id);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 accent-primaryM-500"
                          disabled={acceptedIds.has(f.id)}
                        />

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromList(f.id);
                          }}
                          disabled={deletingId === f.id}
                          className="h-8 w-8 p-0 text-white/60 transition-all duration-75 hover:bg-red-500/30 hover:text-red-400"
                          title={
                            acceptedIds.has(f.id)
                              ? "Remove collaborator"
                              : "Cancel invite"
                          }
                        >
                          <Trash2 className="h-4 w-4 hover:text-red-400" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pb-6">
              <Button
                type="button"
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-primaryM-500 text-black hover:bg-primaryM-600"
                disabled={selected.length === 0 || submitting}
                onClick={handleInvite}
              >
                {submitting
                  ? "Inviting..."
                  : `Invite ${selected.length > 0 ? `(${selected.length})` : ""}`}
              </Button>
            </div>
          </AnimatedModal>
        </>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button
              type="button"
              className="h-8 border border-white/20 bg-white/[0.04] text-xs text-white hover:bg-white/10"
            >
              <span>
                <UserRoundCog className="h-4 w-4" />
              </span>
              Manage collaborators
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[88svh] min-h-[40svh] overflow-hidden border-white/20 shadow-[0_24px_80px_-28px_rgba(0,0,0,0.95)] backdrop-blur-xl">
            <div className="relative rounded-xl border border-white/10 bg-[#0a0a0ed1] p-6">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <span className="mb-3 inline-block rounded-full bg-[#c9a227] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-black">
                Manage collaborators
              </span>

              <h2 className="text-xl font-medium text-white">
                Manage collaborators
              </h2>
              <p className="mt-1 text-sm text-white/40">
                View and manage collaborators for this list. Invite, cancel
                pending invites, or remove existing collaborators.
              </p>

              <div className="mt-5 h-px w-full bg-white/10" />

              <div className="mt-4 space-y-3">
                {loading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <div
                        key={`skeleton-m-${idx}`}
                        className="flex items-center gap-4 rounded-xl p-3"
                      >
                        <Skeleton className="h-9 w-9 rounded-md bg-white/10" />
                        <div className="min-w-0 flex-1">
                          <Skeleton className="mb-2 h-4 w-32 bg-white/10" />
                          <Skeleton className="h-3 w-20 bg-white/10" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : friends.length === 0 ? (
                  <div className="rounded-lg border-dashed border-white/15 bg-transparent p-6 text-center text-xs text-gray-300">
                    No friends available to invite.
                  </div>
                ) : (
                  <div className="max-h-56 overflow-y-auto rounded-md p-1">
                    {friends.map((f) => (
                      <div
                        key={f.id}
                        role="button"
                        tabIndex={0}
                        aria-pressed={selected.includes(f.id)}
                        onClick={() => {
                          if (!acceptedIds.has(f.id)) toggle(f.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            if (!acceptedIds.has(f.id)) toggle(f.id);
                          }
                        }}
                        className="flex cursor-pointer items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 shrink-0">
                            <AvatarImage src={f.image ?? undefined} />
                            <AvatarFallback className="bg-white/10 text-xs text-white">
                              {f.name?.slice(0, 2)?.toUpperCase() ?? "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="flex items-center gap-2 text-sm font-medium text-white">
                              <span className="truncate">
                                {f.name ?? f.username ?? "User"}
                              </span>
                              {acceptedIds.has(f.id) ? (
                                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                                  Joined
                                </span>
                              ) : pendingIds.has(f.id) ? (
                                <span className="bg-yellow-500/12 rounded-full px-2 py-0.5 text-[11px] font-medium text-yellow-300">
                                  Pending
                                </span>
                              ) : null}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              @{f.username ?? "unknown"}
                            </p>
                          </div>
                        </div>

                        <div className="ml-auto flex items-center gap-3">
                          <input
                            aria-label={`Invite ${f.name ?? f.username}`}
                            type="checkbox"
                            checked={
                              acceptedIds.has(f.id) || selected.includes(f.id)
                            }
                            onChange={() => {
                              if (!acceptedIds.has(f.id)) toggle(f.id);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4 accent-primaryM-500"
                            disabled={acceptedIds.has(f.id)}
                          />

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromList(f.id);
                            }}
                            disabled={deletingId === f.id}
                            className="h-8 w-8 p-0 text-white/60 hover:bg-red-500/10 hover:text-red-400"
                            title={
                              acceptedIds.has(f.id)
                                ? "Remove collaborator"
                                : "Cancel invite"
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="bg-primaryM-500 text-black hover:bg-primaryM-600"
                  disabled={selected.length === 0 || submitting}
                  onClick={handleInvite}
                >
                  {submitting
                    ? "Inviting..."
                    : `Invite ${selected.length > 0 ? `(${selected.length})` : ""}`}
                </Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}
