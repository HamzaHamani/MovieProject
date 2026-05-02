"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CloudUpload, ImagePlus, Pencil, Search } from "lucide-react";
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
import { UploadDropzone } from "@/lib/uploadthing";
import { useMediaQuery } from "@/hooks/use-media-query";
import LazyBlurImage from "@/components/ui/lazyBlurImage";
import MentionTextarea from "@/components/ui/mentionTextarea";

type Props = {
  currentUsername: string;
  currentBio?: string | null;
  currentImage?: string | null;
  currentBackdropPath?: string | null;
};

type BackdropSearchResult = {
  id: string;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  year: string;
};

type BackdropImage = {
  file_path: string;
  width: number;
  height: number;
  aspect_ratio: number;
  vote_average: number;
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
  currentBackdropPath,
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
  const [backdropPath, setBackdropPath] = useState(currentBackdropPath ?? "");
  const [backdropQuery, setBackdropQuery] = useState("");
  const [backdropResults, setBackdropResults] = useState<
    BackdropSearchResult[]
  >([]);
  const [isBackdropSearching, setIsBackdropSearching] = useState(false);
  const [isBackdropPickerOpen, setIsBackdropPickerOpen] = useState(false);
  const [selectedBackdropMovie, setSelectedBackdropMovie] =
    useState<BackdropSearchResult | null>(null);
  const [movieBackdrops, setMovieBackdrops] = useState<BackdropImage[]>([]);
  const [isLoadingMovieBackdrops, setIsLoadingMovieBackdrops] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const trimmed = backdropQuery.trim();
    if (selectedBackdropMovie) {
      return;
    }

    if (trimmed.length < 2) {
      setBackdropResults([]);
      setIsBackdropSearching(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setIsBackdropSearching(true);
        const response = await fetch(
          `/api/search/tmdb?q=${encodeURIComponent(trimmed)}`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const json = (await response.json()) as BackdropSearchResult[];
        setBackdropResults(Array.isArray(json) ? json : []);
      } catch {
        if (!controller.signal.aborted) {
          showErrorNotification("Search Error", "Could not search right now");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsBackdropSearching(false);
        }
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [backdropQuery, open, selectedBackdropMovie]);

  const handleSelectBackdropMovie = async (movie: BackdropSearchResult) => {
    setSelectedBackdropMovie(movie);
    setIsLoadingMovieBackdrops(true);

    try {
      const response = await fetch(
        `/api/search/images?id=${movie.id}&type=${movie.mediaType}`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error("Could not fetch backdrops for this title");
      }

      const json = (await response.json()) as BackdropImage[];
      setMovieBackdrops(Array.isArray(json) ? json : []);
    } catch {
      showErrorNotification(
        "Search Error",
        "Could not load backdrops right now",
      );
      setMovieBackdrops([]);
    } finally {
      setIsLoadingMovieBackdrops(false);
    }
  };

  const handleBackToBackdropSearch = () => {
    setSelectedBackdropMovie(null);
    setMovieBackdrops([]);
    setIsLoadingMovieBackdrops(false);
  };

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
          backdropPath: backdropPath || null,
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
        <MentionTextarea
          value={bio}
          onChange={setBio}
          maxLength={240}
          placeholder="Tell people about your taste in films..."
          rows={5}
          className="min-h-[110px] border-white/15 bg-black/30 text-white placeholder:text-gray-500"
        />
        <p className="text-right text-xs text-gray-500">{bio.length}/240</p>
      </div>

      <div className="space-y-3 rounded-2xl border border-white/10 bg-black/40 p-4 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.9)]">
        <button
          type="button"
          onClick={() => {
            setIsBackdropPickerOpen((current) => {
              const next = !current;
              if (!next) {
                setSelectedBackdropMovie(null);
                setMovieBackdrops([]);
                setIsLoadingMovieBackdrops(false);
              }
              return next;
            });
          }}
          className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition hover:border-primaryM-500/50 hover:bg-white/[0.05]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primaryM-500/20 bg-primaryM-500/10 text-primaryM-400">
              <ImagePlus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-100">
                Profile backdrop
              </p>
              <p className="text-xs text-gray-400">
                Click to search TMDb and choose a backdrop image.
              </p>
            </div>
          </div>

          <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs text-gray-300">
            {backdropPath ? "Selected" : "Choose"}
          </span>
        </button>

        {isBackdropPickerOpen ? (
          <div className="space-y-3 rounded-2xl border border-white/10 bg-black/25 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.24em] text-gray-500">
                {selectedBackdropMovie
                  ? "Step 2: select backdrop"
                  : "Step 1: search title"}
              </p>
              <div className="flex items-center gap-2">
                {selectedBackdropMovie ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBackToBackdropSearch}
                    className="h-8 px-3 text-xs text-gray-300 hover:bg-white/10 hover:text-white"
                  >
                    Back
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setBackdropPath("")}
                  className="h-8 px-3 text-xs text-gray-300 hover:bg-white/10 hover:text-white"
                >
                  Clear
                </Button>
              </div>
            </div>

            {!selectedBackdropMovie ? (
              <Input
                value={backdropQuery}
                onChange={(event) => setBackdropQuery(event.target.value)}
                placeholder="Search a film or show..."
                className="border-white/15 bg-black/30 text-white placeholder:text-gray-500"
              />
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                <p className="text-sm font-medium text-white">
                  {selectedBackdropMovie.title}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Select a backdrop from available images
                </p>
              </div>
            )}

            {backdropPath ? (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                <div className="relative aspect-[16/8]">
                  <LazyBlurImage
                    src={`https://image.tmdb.org/t/p/original${backdropPath}`}
                    alt="Selected profile backdrop"
                    className="h-full w-full object-cover"
                    placeholderClassName="bg-zinc-800/70"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <p className="text-sm font-medium text-white">
                      Selected backdrop
                    </p>
                    <p className="text-xs text-gray-300">
                      This image will appear behind your profile header.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-sm text-gray-300">
                No backdrop selected yet.
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.24em] text-gray-500">
                  {selectedBackdropMovie
                    ? "Available backdrops"
                    : "Search results"}
                </p>
                {!selectedBackdropMovie && isBackdropSearching ? (
                  <p className="text-xs text-gray-400">Searching...</p>
                ) : selectedBackdropMovie && isLoadingMovieBackdrops ? (
                  <p className="text-xs text-gray-400">Loading backdrops...</p>
                ) : null}
              </div>

              {!selectedBackdropMovie ? (
                backdropResults.length > 0 ? (
                  <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                    {backdropResults.map((item) => (
                      <button
                        key={`${item.mediaType}-${item.id}`}
                        type="button"
                        onClick={() => handleSelectBackdropMovie(item)}
                        className="group flex w-full items-center gap-3 rounded-xl border border-white/10 p-3 text-left transition hover:border-primaryM-500/50 hover:bg-white/[0.03]"
                      >
                        {item.posterPath ? (
                          <div className="relative h-20 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-white/10">
                            <LazyBlurImage
                              src={`https://image.tmdb.org/t/p/w185${item.posterPath}`}
                              alt={item.title}
                              width={120}
                              height={180}
                              className="h-full w-full object-cover"
                              placeholderClassName="bg-zinc-800/70"
                            />
                          </div>
                        ) : (
                          <div className="flex h-20 w-14 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-[10px] text-gray-500">
                            No image
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="line-clamp-1 text-sm font-medium text-white">
                            {item.title}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {item.year} •{" "}
                            {item.mediaType === "tv" ? "TV" : "Movie"}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : backdropQuery.trim().length >= 2 && !isBackdropSearching ? (
                  <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-sm text-gray-300">
                    No titles found. Try a different search.
                  </div>
                ) : null
              ) : isLoadingMovieBackdrops ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-sm text-gray-300">
                  Loading backdrops...
                </div>
              ) : movieBackdrops.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {movieBackdrops.map((item, idx) => {
                    const isSelected = item.file_path === backdropPath;

                    return (
                      <button
                        key={`${item.file_path}-${idx}`}
                        type="button"
                        onClick={() => setBackdropPath(item.file_path)}
                        className={`group relative overflow-hidden rounded-2xl border text-left transition hover:border-primaryM-500/50 ${
                          isSelected
                            ? "border-primaryM-500/70 ring-1 ring-primaryM-500/40"
                            : "border-white/10"
                        }`}
                      >
                        <div className="relative aspect-[16/9] bg-black/40">
                          <LazyBlurImage
                            src={`https://image.tmdb.org/t/p/w780${item.file_path}`}
                            alt={`${selectedBackdropMovie.title} backdrop ${idx + 1}`}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                            placeholderClassName="bg-zinc-800/70"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                          <div className="absolute inset-x-0 bottom-0 p-3">
                            <p className="line-clamp-1 text-sm font-medium text-white">
                              {selectedBackdropMovie.title}
                            </p>
                            <p className="mt-1 text-xs text-gray-300">
                              {selectedBackdropMovie.mediaType === "tv" ? "TV" : "Movie"}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-sm text-gray-300">
                  No backdrops available for this title.
                </div>
              )}
            </div>
          </div>
        ) : null}
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

        <DialogContent className="max-h-[88svh] w-[min(700px,94vw)] overflow-y-auto p-5">
          <DialogHeader className="pb-1">
            <DialogTitle className="text-white">Edit profile</DialogTitle>
            <DialogDescription className="text-gray-300">
              Update your username, bio, profile picture, and backdrop.
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
      <DrawerContent className="max-h-[88svh] overflow-hidden px-4">
        <DrawerHeader className="px-0 pb-2 pt-2 text-left">
          <DrawerTitle className="text-white">Edit profile</DrawerTitle>
          <DrawerDescription className="text-gray-300">
            Update your username, bio, profile picture, and backdrop.
          </DrawerDescription>
        </DrawerHeader>

        <div className="min-h-0 overflow-y-auto overscroll-contain pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {formContent}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
