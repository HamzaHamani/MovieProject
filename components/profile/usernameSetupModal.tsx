"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { completeUsernameSetup } from "@/lib/actions";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/components/notificationSystem";

type Props = {
  openByDefault: boolean;
  suggestedName?: string | null;
};

function toUsernameSuggestion(value?: string | null) {
  if (!value) return "";

  const cleaned = value
    .toLowerCase()
    .replace(/[^a-z0-9_\s]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 24);

  return cleaned;
}

export default function UsernameSetupModal({
  openByDefault,
  suggestedName,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(openByDefault);
  const [username, setUsername] = useState(
    toUsernameSuggestion(suggestedName) || "",
  );
  const [isPending, startTransition] = useTransition();
  const [showNsfw, setShowNsfw] = useState(false);

  const isValidLength = useMemo(() => {
    const trimmed = username.trim();
    return trimmed.length >= 3 && trimmed.length <= 24;
  }, [username]);

  const onSubmit = () => {
    const value = username.trim();
    if (!value) return;

    startTransition(async () => {
      try {
        const result = await completeUsernameSetup(value, showNsfw);

        if (!result.ok) {
          showErrorNotification("Username", result.error);
          return;
        }

        showSuccessNotification("Profile", "Username saved successfully");
        setOpen(false);
        router.replace("/explore");
        router.refresh();
      } catch {
        showErrorNotification(
          "Username",
          "Could not save username. Please try again.",
        );
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="border-gray-700 bg-[#111111] text-white sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Choose your username</DialogTitle>
          <DialogDescription className="text-gray-400">
            Pick a unique username for your public profile. Use 3-24 lowercase
            letters, numbers, or underscores.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            value={username}
            onChange={(event) => setUsername(event.target.value.toLowerCase())}
            placeholder="your_username"
            autoFocus
            className="border-white/15 bg-black/40 text-white placeholder:text-gray-500"
          />

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={showNsfw}
              onChange={(e) => setShowNsfw(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm text-gray-300">Show NSFW content</span>
          </label>

          <Button
            type="button"
            onClick={onSubmit}
            disabled={isPending || !isValidLength}
            className="w-full bg-primaryM-500 text-black hover:bg-primaryM-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save username"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
