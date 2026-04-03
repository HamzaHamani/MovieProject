"use client";
import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
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
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ListPlus, LogIn, PlusCircle } from "lucide-react";
import CreateListForm from "../createListForm";
import { useQuery } from "@tanstack/react-query";
import { getBookmarks, getMovieLists } from "@/lib/actions";
import CheckBoxes from "@/components/general/checkBoxes";

export function DrawerDialogButtonList({
  userId,
  movieId,
  itemTitle,
  itemPosterPath,
}: {
  userId?: string;
  movieId: string | number;
  itemTitle: string;
  itemPosterPath: string | null;
}) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant={"outline"}
            className="flex items-center gap-2 border-gray-300/70 bg-transparent text-white hover:bg-white/10 xsmd:text-xs"
          >
            <span>
              <PlusCircle />
            </span>{" "}
            <span className="sss:hidden">Add List</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="overflow-hidden border-white/10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.14),transparent_48%),theme(colors.backgroundM)] text-textMain sm:max-w-[620px]">
          <DialogHeader className="border-b border-white/10 pb-4">
            <DialogTitle className="flex items-center gap-2 text-white">
              <ListPlus className="h-5 w-5 text-primaryM-500" /> Add to your
              lists
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Select one of your lists or create a new one.
            </DialogDescription>
          </DialogHeader>
          <ProfileForm
            userId={userId}
            movieId={movieId}
            itemTitle={itemTitle}
            itemPosterPath={itemPosterPath}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant={"outline"}
          className="flex items-center gap-2 border-gray-300/70 bg-transparent text-white hover:bg-white/10 xsmd:text-xs"
        >
          <span>
            <PlusCircle />
          </span>{" "}
          <span className="sss:hidden">Add List</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-backgroundM">
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2 text-white">
            <ListPlus className="h-5 w-5 text-primaryM-500" /> Add to your lists
          </DrawerTitle>
          <DrawerDescription className="text-gray-300">
            Select one of your lists or create a new one.
          </DrawerDescription>
        </DrawerHeader>
        <ProfileForm
          className="px-4"
          userId={userId}
          movieId={movieId}
          itemTitle={itemTitle}
          itemPosterPath={itemPosterPath}
        />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
export function ProfileForm({
  movieId,
  className,
  userId,
  itemTitle,
  itemPosterPath,
}: {
  className?: any;
  userId?: string;
  movieId: string | number;
  itemTitle: string;
  itemPosterPath: string | null;
}) {
  const isLoggedIn = Boolean(userId);

  const { data: MoiveListsData } = useQuery({
    queryKey: ["movieLists", movieId],
    queryFn: () => getMovieLists(String(movieId)),
    enabled: isLoggedIn,
  });
  // React.ComponentProps<"form">
  const [showForm, setShowForm] = React.useState(false);
  const [selectedLists, setSelectedLists] = React.useState<(string | number)[]>(
    [],
  );
  const { data, error, isLoading } = useQuery({
    queryKey: ["bookmarks", userId],
    queryFn: () => getBookmarks(userId as string),
    enabled: isLoggedIn,
  });

  if (!isLoggedIn) {
    return (
      <div className={cn("grid items-start gap-4", className)}>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-gray-300">
          You need to login first to view your lists and add this title.
        </div>
        <Button
          asChild
          className="w-full bg-primaryM-500 text-black hover:bg-primaryM-600"
        >
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center gap-2"
          >
            <LogIn className="h-4 w-4" /> Go to Sign In
          </Link>
        </Button>
      </div>
    );
  }

  if (isLoading)
    return <p className="text-sm text-gray-300">Loading your lists...</p>;
  if (error)
    return <p className="text-sm text-red-400">Could not load your lists.</p>;
  const bookmarksData = data ?? [];

  return (
    <div className={cn("grid items-start gap-4", className)}>
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        {!showForm ? (
          bookmarksData.length === 0 ? (
            <h2 className="rounded-lg border border-dashed border-white/20 bg-white/[0.02] p-5 text-center text-sm text-gray-300">
              You have no lists yet. Create your first one.
            </h2>
          ) : (
            <CheckBoxes
              MoiveListsData={MoiveListsData}
              movieId={movieId}
              itemTitle={itemTitle}
              itemPosterPath={itemPosterPath}
              data={bookmarksData}
              setSelectedLists={setSelectedLists}
              showForm={showForm}
              selectedLists={selectedLists}
            />
          )
        ) : null}

        {showForm && (
          <CreateListForm setShowForm={setShowForm} userId={userId as string} />
        )}
      </div>

      <Button
        type="submit"
        className="mt-2 w-full bg-primaryM-500 text-black hover:bg-primaryM-600"
        onClick={() => setShowForm((value) => !value)}
      >
        {showForm ? "Cancel" : "Create List"}
      </Button>
    </div>
  );
}
