"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";

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
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMediaQuery } from "@/hooks/use-media-query";

export default function CreateListQuick() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const router = useRouter();

  const resetForm = () => {
    setName("");
    setDescription("");
  };

  const closeAndReset = () => {
    setOpen(false);
    resetForm();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
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
        }),
      });

      const json = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(json.error ?? "Could not create list");
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
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3"
    >
      <div className="space-y-3">
        <div>
          <p className="mb-1 text-xs uppercase tracking-[0.2em] text-gray-400">
            List name
          </p>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Favorites from 2026"
            className="h-10 border-white/15 bg-white/5 text-sm text-white"
            maxLength={60}
          />
        </div>

        <div>
          <p className="mb-1 text-xs uppercase tracking-[0.2em] text-gray-400">
            Description
          </p>
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="A short description for this list"
            className="min-h-[140px] resize-y border-white/15 bg-white/5 text-sm text-white"
            maxLength={180}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-primaryM-500 text-black hover:bg-primaryM-600"
        >
          {isSubmitting ? "Creating..." : "Create list"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          className="border-white/20 bg-white/5 text-white hover:bg-white/10"
          onClick={closeAndReset}
        >
          Cancel
        </Button>
      </div>
    </form>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            type="button"
            className="bg-primaryM-500 text-black hover:bg-primaryM-600"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create List
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[88svh] w-[min(700px,94vw)] overflow-y-auto border-white/10 bg-[radial-gradient(circle_at_top,_rgba(234,179,8,0.14),transparent_45%),linear-gradient(180deg,rgba(12,12,12,0.96)_0%,rgba(8,8,8,0.96)_100%)] p-5 text-textMain">
          <DialogHeader className="pb-1">
            <DialogTitle className="text-white">Create a new list</DialogTitle>
            <DialogDescription className="text-gray-300">
              Add a name and description, then start saving movies and TV shows.
            </DialogDescription>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
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
      <DrawerContent className="max-h-[88svh] overflow-hidden border-white/10 bg-[radial-gradient(circle_at_top,_rgba(234,179,8,0.14),transparent_45%),linear-gradient(180deg,rgba(12,12,12,0.96)_0%,rgba(8,8,8,0.96)_100%)] px-4 text-textMain">
        <DrawerHeader className="px-0 pb-2 pt-2 text-left">
          <DrawerTitle className="text-white">Create a new list</DrawerTitle>
          <DrawerDescription className="text-gray-300">
            Add a name and description, then start saving movies and TV shows.
          </DrawerDescription>
        </DrawerHeader>
        <div className="min-h-0 overflow-y-auto overscroll-contain pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {formContent}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
