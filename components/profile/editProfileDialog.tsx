"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CloudUpload, Pencil } from "lucide-react";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/components/notificationSystem";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { UploadDropzone } from "@/lib/uploadthing";
import { useMediaQuery } from "@/hooks/use-media-query";

type Props = {
  currentUsername: string;
  currentBio?: string | null;
  currentImage?: string | null;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export default function EditProfileDialog({
  currentUsername,
  currentBio,
  currentImage,
}: Props) {
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [username, setUsername] = useState(currentUsername);
  const [bio, setBio] = useState(currentBio ?? "");
  const [imageUrl, setImageUrl] = useState(currentImage ?? "");

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
  };

  async function handleSave() {
    if (!username.trim()) {
      showErrorNotification("Profile Error", "Username is required");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          bio,
          image: imageUrl || null,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error ?? "Could not update profile");
      }

      showSuccessNotification("Profile updated", "Your changes are saved.");
      setOpen(false);

      const nextUsername = String(payload.username ?? currentUsername);
      if (nextUsername !== currentUsername) {
        router.push(`/profile/${nextUsername}`);
      }

      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not update profile";
      showErrorNotification("Profile Error", message);
    } finally {
      setIsSaving(false);
    }
  }

  const formContent = (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-black/40 p-4 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.9)]">
        <div className="mb-3 flex items-center gap-3">
          <Avatar className="h-14 w-14 border border-white/10">
            <AvatarImage src={imageUrl || undefined} alt={username} />
            <AvatarFallback className="bg-white/10 text-white">
              {getInitials(username || "User")}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-100">Profile picture</p>
            <p className="text-xs text-gray-400">
              Drag and drop or choose a file to upload.
            </p>
          </div>
        </div>

        <UploadDropzone
          endpoint="profileImageUploader"
          className="rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-4 py-5 transition hover:border-primaryM-500/60 hover:bg-white/[0.05]"
          config={{
            mode: "auto",
          }}
          appearance={{
            container: "w-full max-w-none",
            uploadIcon: "text-primaryM-400",
            label: "text-sm text-gray-200",
            allowedContent: "text-xs text-gray-500",
            button: "hidden ut-ready:hidden",
          }}
          content={{
            uploadIcon: <CloudUpload className="h-5 w-5 text-primaryM-400" />,
            label: (
              <span className="text-sm text-gray-200">
                Drag and drop or{" "}
                <span className="text-primaryM-400">choose file</span> to upload
              </span>
            ),
            allowedContent: (
              <span className="text-xs text-gray-500">
                Images only, up to 4MB.
              </span>
            ),
          }}
          onUploadBegin={() => {
            setIsUploadingImage(true);
            setUploadProgress(0);
            showSuccessNotification("Uploading image", "Upload started...");
          }}
          onUploadProgress={(progress) => {
            setUploadProgress(progress);
          }}
          onClientUploadComplete={(result) => {
            const first = result?.[0];
            const url = first?.ufsUrl ?? first?.url;
            setIsUploadingImage(false);
            setUploadProgress(100);
            if (url) {
              setImageUrl(url);
              showSuccessNotification(
                "Image uploaded",
                "Save changes to apply it.",
              );
            }
          }}
          onUploadError={(error: Error) => {
            setIsUploadingImage(false);
            setUploadProgress(0);
            showErrorNotification(
              "Upload Error",
              error.message || "Upload failed",
            );
          }}
        />
        <p className="mt-2 text-xs text-gray-400">
          {isUploadingImage
            ? `Uploading image... ${uploadProgress}%`
            : uploadProgress === 100
              ? "Upload complete. Click Save changes to apply it."
              : "Images only, up to 4MB."}
        </p>
      </div>

      <div className="space-y-2 rounded-xl border border-white/10 bg-black/25 p-3">
        <label className="text-sm text-gray-300">Username</label>
        <Input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="your_username"
          className="border-white/15 bg-black/30 text-white placeholder:text-gray-500"
        />
        <p className="text-xs text-gray-500">
          3-24 chars, lowercase letters, numbers, underscores.
        </p>
      </div>

      <div className="space-y-2 rounded-xl border border-white/10 bg-black/25 p-3">
        <label className="text-sm text-gray-300">Bio</label>
        <Textarea
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          maxLength={240}
          placeholder="Tell people about your taste in movies..."
          className="min-h-[110px] border-white/15 bg-black/30 text-white placeholder:text-gray-500"
        />
        <p className="text-right text-xs text-gray-500">{bio.length}/240</p>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(false)}
          className="border-white/15 bg-white/5 text-white hover:bg-white/10"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primaryM-500 text-black hover:bg-primaryM-600 disabled:opacity-70"
        >
          {isSaving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  );

  const trigger = (
    <Button
      variant="outline"
      className="border-white/15 bg-white/5 text-white hover:bg-white/10"
    >
      <Pencil className="mr-2 h-4 w-4" />
      Edit Profile
    </Button>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>

        <DialogContent className="max-h-[88svh] w-[min(700px,94vw)] overflow-y-auto border-white/10 bg-[radial-gradient(circle_at_top,_rgba(234,179,8,0.14),transparent_45%),linear-gradient(180deg,rgba(12,12,12,0.96)_0%,rgba(8,8,8,0.96)_100%)] p-5 text-textMain">
          <DialogHeader className="pb-1">
            <DialogTitle className="text-white">Edit profile</DialogTitle>
            <DialogDescription className="text-gray-300">
              Update your username, bio, and profile picture.
            </DialogDescription>
          </DialogHeader>

          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className="max-h-[88svh] overflow-hidden border-white/10 bg-[radial-gradient(circle_at_top,_rgba(234,179,8,0.14),transparent_45%),linear-gradient(180deg,rgba(12,12,12,0.96)_0%,rgba(8,8,8,0.96)_100%)] px-4 text-textMain">
        <DrawerHeader className="px-0 pb-2 pt-2 text-left">
          <DrawerTitle className="text-white">Edit profile</DrawerTitle>
          <DrawerDescription className="text-gray-300">
            Update your username, bio, and profile picture.
          </DrawerDescription>
        </DrawerHeader>

        <div className="min-h-0 overflow-y-auto overscroll-contain pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {formContent}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
