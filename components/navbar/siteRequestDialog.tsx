"use client";

import { FormEvent, useEffect, useState } from "react";
import { MessageSquareText, Send, X } from "lucide-react";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/components/notificationSystem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { AnimatedModal } from "@/components/ui/animated-modal";
import { useMediaQuery } from "@/hooks/use-media-query";

export default function SiteRequestDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const resetForm = () => {
    setTitle("");
    setMessage("");
  };

  const closeAndReset = () => {
    setOpen(false);
    resetForm();
  };

  const checkAuth = async () => {
    setCheckingAuth(true);
    try {
      const response = await fetch("/api/auth/session", {
        cache: "no-store",
      });
      const data = response.ok ? await response.json() : null;
      setIsLoggedIn(Boolean(data?.user));
    } catch {
      setIsLoggedIn(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  // Check once on mount so the trigger/dialog reflects auth state promptly.
  useEffect(() => {
    void checkAuth();
  }, []);

  // Re-check whenever the dialog is opened, in case the session changed
  // since the last check (e.g. user just signed in in another tab).
  const handleOpen = () => {
    setOpen(true);
    void checkAuth();
  };

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();

    if (!isLoggedIn) {
      showErrorNotification(
        "Request Error",
        "You must be logged in to send a request.",
      );
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();

    if (!trimmedTitle) {
      showErrorNotification("Request Error", "Title is required.");
      return;
    }

    if (!trimmedMessage) {
      showErrorNotification("Request Error", "Message is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/site-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: trimmedTitle,
          message: trimmedMessage,
        }),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !result.ok) {
        if (response.status === 401) {
          setIsLoggedIn(false);
        }
        showErrorNotification(
          "Request Error",
          result.error ?? "Could not submit your request right now.",
        );
        return;
      }

      showSuccessNotification(
        "Request sent",
        "Thanks. Your request was submitted to the site creator.",
      );
      resetForm();
      closeAndReset();
    } catch {
      showErrorNotification(
        "Request Error",
        "Could not submit your request right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = isLoggedIn === true && !isSubmitting && !checkingAuth;

  const formContent = (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-3">
      <p className="text-xs uppercase tracking-[0.22em] text-gray-400">
        Send Request
      </p>

      {isLoggedIn === false && (
        <p className="text-sm font-medium text-red-500">
          You must be logged in to send a request.
        </p>
      )}

      <Input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Add a missing title"
        className="border-white/15 bg-white/5 text-white placeholder:text-gray-500"
        required
        maxLength={120}
        disabled={isLoggedIn === false}
      />
      <Textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Tell me what you want added, changed, or asked about."
        className="min-h-[160px] border-white/15 bg-white/5 text-white placeholder:text-gray-500"
        required
        maxLength={5000}
        disabled={isLoggedIn === false}
      />

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
          className="bg-primaryM-500 text-black hover:bg-primaryM-600 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canSubmit}
        >
          <Send className="mr-2 h-4 w-4" />
          {isSubmitting ? "Submitting..." : "Send request"}
        </Button>
      </div>
    </form>
  );

  if (isDesktop) {
    return (
      <>
        <Button
          type="button"
          variant="ghost"
          className="h-10 rounded-full border border-white/15 bg-white/5 px-3 text-sm font-medium text-gray-200 hover:bg-white/10 hover:text-white"
          onClick={handleOpen}
        >
          <MessageSquareText className="mr-1.5 h-4 w-4 text-primaryM-500" />
          Request
        </Button>

        <AnimatedModal
          open={open}
          onClose={closeAndReset}
          maxWidth="760px"
          className="relative z-10 w-full overflow-hidden rounded-2xl border border-white/10 bg-backgroundM px-7 shadow-[0_24px_80px_-28px_rgba(0,0,0,0.95)]"
        >
          <span className="mb-3 mt-6 inline-block rounded-full bg-[#c9a227] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-black">
            Request
          </span>

          <h2 className="text-xl font-medium text-white">
            Send a request or contact the creator
          </h2>
          <p className="mt-1 text-sm text-white/40">
            Ask for a feature, report missing content, or share feedback. If you
            are signed in, your account is attached automatically.
          </p>

          <div className="mt-5 h-px w-full bg-white/10" />

          <div className="px-0 pb-3 pt-5">{formContent}</div>
        </AnimatedModal>
      </>
    );
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => (next ? handleOpen() : setOpen(next))}
    >
      <DrawerTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-10 rounded-full border border-white/15 bg-white/5 px-3 text-sm font-medium text-gray-200 hover:bg-white/10 hover:text-white"
          onClick={handleOpen}
        >
          <MessageSquareText className="mr-1.5 h-4 w-4 text-primaryM-500" />
          Request
        </Button>
      </DrawerTrigger>

      <DrawerContent className="with-popup-shell max-h-[88svh] overflow-hidden border-0 bg-transparent from-transparent">
        <div className="relative rounded-xl border border-white/10 bg-backgroundM p-6">
          <button
            type="button"
            onClick={closeAndReset}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>

          <span className="mb-3 inline-block rounded-full bg-[#c9a227] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-black">
            Request
          </span>

          <h2 className="text-xl font-medium text-white">
            Send a request or contact the creator
          </h2>
          <p className="mt-1 text-sm text-white/40">
            Ask for a feature, report missing content, or share feedback. If you
            are signed in, your account is attached automatically.
          </p>

          <div className="mt-5 h-px w-full bg-white/10" />

          <div className="px-0 pb-3 pt-5">{formContent}</div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
