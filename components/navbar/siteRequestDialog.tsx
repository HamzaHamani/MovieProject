"use client";

import { useState } from "react";
import { MessageCirclePlus } from "lucide-react";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/components/notificationSystem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function SiteRequestDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setTitle("");
    setMessage("");
  };

  const handleSubmit = async () => {
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
      setOpen(false);
    } catch {
      showErrorNotification(
        "Request Error",
        "Could not submit your request right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 rounded-full border border-white/15 bg-white/5 px-3 text-sm font-medium text-gray-200 hover:bg-white/10 hover:text-white"
        >
          <MessageCirclePlus className="mr-1.5 h-4 w-4 text-primaryM-500" />
          Request
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg border border-white/15 bg-[#0d0d12f0]">
        <DialogHeader>
          <DialogTitle>Send a Request</DialogTitle>
          <DialogDescription className="text-sm text-gray-400">
            Ask for a feature, report missing content, or contact the creator.
            Both fields are required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-[0.16em] text-gray-400">
              Title
            </label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              placeholder="Example: Add movie XYZ"
              className="border-white/15 bg-white/[0.03] text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-[0.16em] text-gray-400">
              Message
            </label>
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={5000}
              rows={6}
              placeholder="Write what you want to add or any message for the creator..."
              className="resize-none border-white/15 bg-white/[0.03] text-white placeholder:text-gray-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
              className="border-white/20 bg-transparent text-gray-200 hover:bg-white/10 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={isSubmitting}
              className="bg-primaryM-500 text-black hover:bg-primaryM-600"
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
