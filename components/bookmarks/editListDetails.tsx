"use client";

import { useEffect, useState } from "react";
import { Edit2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { AnimatedModal } from "@/components/ui/animated-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/components/notificationSystem";

export default function EditListDetails({
  bookmarkId,
  initialName,
  initialDescription,
  initialIsPublic,
}: {
  bookmarkId: string;
  initialName: string;
  initialDescription?: string | null;
  initialIsPublic?: boolean | null;
}) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [name, setName] = useState(initialName ?? "");
  const [description, setDescription] = useState(initialDescription ?? "");
  const [isPublic, setIsPublic] = useState(Boolean(initialIsPublic));
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim())
      return showErrorNotification("Validation", "List name is required");
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookmarks/update-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookmarkId,
          bookmarkName: name.trim(),
          description: description ?? "",
          isPublic,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Update failed");

      showSuccessNotification("Saved", "List details updated");
      setOpen(false);
      router.refresh();
    } catch (err) {
      showErrorNotification(
        "Update Error",
        err instanceof Error ? err.message : "Could not update",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const panel = (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-xs uppercase tracking-[0.22em] text-gray-400">
        Edit List
      </p>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border-white/15 bg-white/5 text-white"
        required
      />
      <Input
        value={description ?? ""}
        onChange={(e) => setDescription(e.target.value)}
        className="border-white/15 bg-white/5 text-white"
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

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          className="border-white/20 bg-white/5 text-white hover:bg-white/10"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-primaryM-500 text-black hover:bg-primaryM-600"
          disabled={submitting}
        >
          {submitting ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );

  return (
    <>
      {isDesktop ? (
        <>
          <Button
            type="button"
            className="h-8 w-8 border border-white/20 bg-white/[0.04] p-0 text-white hover:bg-white/10"
            onClick={() => setOpen(true)}
            title="Edit list"
          >
            <Edit2 className="h-4 w-4" />
          </Button>

          <AnimatedModal
            open={open}
            onClose={() => setOpen(false)}
            maxWidth="640px"
            className="relative z-10 w-full overflow-hidden rounded-2xl border border-white/10 bg-backgroundM px-7 shadow-[0_24px_80px_-28px_rgba(0,0,0,0.95)]"
          >
            <span className="mb-3 mt-6 inline-block rounded-full bg-[#c9a227] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-black">
              Edit List
            </span>
            <h2 className="text-xl font-medium text-white">Edit list</h2>
            <p className="mt-1 text-sm text-white/40">
              Update your list details and privacy settings.
            </p>
            <div className="mt-5 h-px w-full bg-white/10" />
            <div className="mt-4">{panel}</div>
          </AnimatedModal>
        </>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button
              type="button"
              className="h-8 w-8 border border-white/20 bg-white/[0.04] p-0 text-white hover:bg-white/10"
              title="Edit list"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="with-popup-shell max-h-[88svh] overflow-hidden border-0 bg-transparent from-transparent">
            <div className="relative rounded-xl border border-white/10 bg-backgroundM p-6">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <span className="mb-3 inline-block rounded-full bg-[#c9a227] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-black">
                Edit List
              </span>
              <h2 className="text-xl font-medium text-white">Edit list</h2>
              <p className="mt-1 text-sm text-white/40">
                Update your list details and privacy settings.
              </p>
              <div className="mt-5 h-px w-full bg-white/10" />

              <div className="px-0 pb-3 pt-5">{panel}</div>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}
