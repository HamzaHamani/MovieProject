"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { showProfileMovieToast } from "@/components/profile/profileToasts";
import { showErrorNotification } from "@/components/notificationSystem";
import MentionTextarea from "@/components/ui/mentionTextarea";

export function ReplyForm({
  reviewId,
  mediaTitle,
  posterPath,
  onSubmit,
}: {
  reviewId: string;
  mediaTitle: string;
  posterPath: string | null;
  onSubmit: (formData: FormData) => Promise<void>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!content.trim()) {
      showErrorNotification("Empty Reply", "Reply cannot be empty");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("reviewId", reviewId);
      formData.append("replyContent", content);

      await onSubmit(formData);

      showProfileMovieToast({
        title: mediaTitle,
        message: "Reply added",
        posterPath,
      });
      setContent("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to add reply";
      showErrorNotification("Reply Error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 gap-2">
      <input type="hidden" name="reviewId" value={reviewId} />
      <MentionTextarea
        name="replyContent"
        placeholder="Write a reply..."
        value={content}
        onChange={setContent}
        rows={1}
        disabled={isSubmitting}
        className="min-h-10 resize-none border-white/15 bg-white/5 text-white"
      />
      <Button
        type="submit"
        disabled={isSubmitting}
        className="bg-primaryM-500 text-black hover:bg-primaryM-600"
      >
        {isSubmitting ? "..." : "Reply"}
      </Button>
    </form>
  );
}
