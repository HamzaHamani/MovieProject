"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { AnimatedModal } from "@/components/ui/animated-modal";

import {
  showErrorNotification,
  showSuccessNotification,
} from "@/components/notificationSystem";
import { Button } from "@/components/ui/button";
import { getFriendsForCurrentUser } from "@/lib/actions";

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
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    void getFriendsForCurrentUser()
      .then((list) => setFriends(list ?? []))
      .catch(() => setFriends([]))
      .finally(() => setLoading(false));
  }, [open]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleInvite = async () => {
    if (selected.length === 0) return;
    setSubmitting(true);
    try {
      await Promise.all(
        selected.map((userId) =>
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
            Invite collaborators
          </Button>

          <AnimatedModal
              open={open}
              onClose={() => setOpen(false)}
              maxWidth="640px"
              className="relative z-10 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0ed1] shadow-[0_24px_80px_-28px_rgba(0,0,0,0.95)]"
            >
              <span className="mb-3 mt-6 inline-block rounded-full bg-[#c9a227] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-black">
                Invite collaborators
              </span>

              <h2 className="text-xl font-medium text-white">Invite collaborators</h2>
              <p className="mt-1 text-sm text-white/40">Select friends to invite as collaborators on this list.</p>

              <div className="mt-5 h-px w-full bg-white/10" />

              <div className="mt-4 space-y-3">
                {loading ? (
                  <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs text-gray-300">Loading friends...</div>
                ) : friends.length === 0 ? (
                  <div className="rounded-lg border-dashed border-white/15 bg-transparent p-6 text-center text-xs text-gray-300">No friends available to invite.</div>
                ) : (
                  <div className="max-h-56 overflow-y-auto rounded-md p-1">
                    {friends.map((f) => (
                      <div
                        key={f.id}
                        role="button"
                        tabIndex={0}
                        aria-pressed={selected.includes(f.id)}
                        onClick={() => toggle(f.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggle(f.id);
                          }
                        }}
                        className="flex cursor-pointer items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-3"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.03]">
                          <input
                            aria-label={`Invite ${f.name ?? f.username}`}
                            type="checkbox"
                            checked={selected.includes(f.id)}
                            onChange={() => toggle(f.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4 accent-primaryM-500"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white">{f.name ?? f.username ?? "User"}</p>
                          <p className="mt-1 text-xs text-gray-400">@{f.username ?? "unknown"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pb-6">
                <Button type="button" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="button" className="bg-primaryM-500 text-black hover:bg-primaryM-600" disabled={selected.length === 0 || submitting} onClick={handleInvite}>
                  {submitting ? "Inviting..." : `Invite ${selected.length > 0 ? `(${selected.length})` : ""}`}
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
              Invite collaborators
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[88svh] min-h-[40svh] overflow-hidden bg-[#0a0a0ed1] border border-white/20 shadow-[0_24px_80px_-28px_rgba(0,0,0,0.95)] backdrop-blur-xl">
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
                Invite collaborators
              </span>

              <h2 className="text-xl font-medium text-white">
                Invite collaborators
              </h2>
              <p className="mt-1 text-sm text-white/40">
                Select friends to invite as collaborators on this list.
              </p>

              <div className="mt-5 h-px w-full bg-white/10" />

              <div className="mt-4 space-y-3">
                {loading ? (
                  <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs text-gray-300">
                    Loading friends...
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
                        onClick={() => toggle(f.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggle(f.id);
                          }
                        }}
                        className="flex cursor-pointer items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-3"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.03]">
                          <input
                            aria-label={`Invite ${f.name ?? f.username}`}
                            type="checkbox"
                            checked={selected.includes(f.id)}
                            onChange={() => toggle(f.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4 accent-primaryM-500"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white">
                            {f.name ?? f.username ?? "User"}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            @{f.username ?? "unknown"}
                          </p>
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
