"use client";

import { useState } from "react";
import { MessageSquareText, Send } from "lucide-react";

import {
  showErrorNotification,
  showSuccessNotification,
} from "@/components/notificationSystem";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function SiteRequestDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setTitle("");
    setMessage("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();

    if (trimmedTitle.length < 3) {
      showErrorNotification(
        "Request title",
        "Title must be at least 3 characters.",
      );
      return;
    }

    if (trimmedMessage.length < 10) {
      showErrorNotification(
        "Request message",
        "Message must be at least 10 characters.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/site-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          message: trimmedMessage,
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not submit request");
      }

      showSuccessNotification(
        "Request sent",
        "Your message reached the creator inbox.",
      );
      setOpen(false);
      resetForm();
    } catch (error) {
      showErrorNotification(
        "Request failed",
        error instanceof Error ? error.message : "Could not submit request",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white hover:bg-white/10"
        >
          <MessageSquareText className="h-4 w-4" />
          Request
        </Button>
      </DialogTrigger>
      <DialogContent className="with-popup-shell max-h-[88svh] w-[min(560px,92vw)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send a request</DialogTitle>
          <DialogDescription>
            Ask for a feature, share feedback, or contact the creator of the site.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-gray-400">
              Title
            </label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Add a subtitle to reviews"
              className="border-white/15 bg-white/5 text-white placeholder:text-gray-500"
              required
              maxLength={120}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-gray-400">
              Message
            </label>
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Tell us what you want to change or ask about."
              className="min-h-[150px] border-white/15 bg-white/5 text-white placeholder:text-gray-500"
              required
              maxLength={2000}
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="border-white/15 bg-white/5 text-white hover:bg-white/10"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primaryM-500 text-black hover:bg-primaryM-600"
              disabled={isSubmitting}
            >
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting ? "Sending..." : "Send request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}