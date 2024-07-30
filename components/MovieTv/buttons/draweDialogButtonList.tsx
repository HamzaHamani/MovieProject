"use client";
import * as React from "react";

import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { PlusCircle } from "lucide-react";
import CreateListForm from "../createListForm";
import { useQuery } from "@tanstack/react-query";
import { getBookmarks } from "@/lib/actions";
import { Checkbox } from "@/components/ui/checkbox";
import { bookmarksSchema } from "@/types";
import { z } from "zod";
type bookSchemaType = z.infer<typeof bookmarksSchema>;

export function DrawerDialogButtonList({ userId }: { userId: any }) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant={"outline"}
            className="flex items-center gap-2 border-gray-300 bg-transparent xsmd:text-xs"
          >
            <span>
              <PlusCircle />
            </span>{" "}
            <span className="sss:hidden">Add List</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="border-none sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add to your lists</DialogTitle>
            {/* <DialogDescription>
              Make changes to your profile here. Click save when youre done.
            </DialogDescription> */}
          </DialogHeader>
          <ProfileForm userId={userId} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant={"outline"}
          className="flex items-center gap-2 border-gray-300 bg-transparent xsmd:text-xs"
        >
          <span>
            <PlusCircle />
          </span>{" "}
          <span className="sss:hidden">Add List</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Add to your lists</DrawerTitle>
          <DrawerDescription>
            {/* Make changes to your profile here. Click save when youre done. */}
          </DrawerDescription>
        </DrawerHeader>
        <ProfileForm className="px-4" userId={userId} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
function ListDisplay({ data }: { data: bookSchemaType[] }) {
  return (
    <div className="flex flex-col gap-2">
      {" "}
      {data.map((val) => {
        return (
          <div key={val.bookmarkName} className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              className="h-6 w-6 border-[0.5px] border-white"
            />
            <label
              htmlFor="terms"
              className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {val.bookmarkName}
            </label>
          </div>
        );
      })}
    </div>
  );
}

export function ProfileForm({
  className,
  userId,
}: {
  className?: any;
  userId: any;
}) {
  // React.ComponentProps<"form">
  const [showForm, setShowForm] = React.useState(false);
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["bookmarks", userId],
    queryFn: () => getBookmarks(userId),
  });

  if (isLoading) return <p>loading</p>;
  if (error) return <p>error</p>;
  const bookmarksData = data ?? [];
  return (
    <div className={cn("grid items-start gap-4", className)}>
      <div className="mb-2 mt-9 flex flex-col items-center justify-center gap-4">
        {" "}
        {data?.length === 0 ? (
          <h2>You have no lists, you must create one</h2>
        ) : (
          <ListDisplay data={bookmarksData} />
        )}
      </div>
      {showForm && <CreateListForm setShowForm={setShowForm} userId={userId} />}
      {data?.length !== 0 && (
        <Button
          disabled={true}
          className="j mt-2 items-end justify-end self-end bg-indigo-500 text-end"
        >
          Add
        </Button>
      )}

      <Button
        type="submit"
        className="j mt-2 w-full bg-indigo-500"
        onClick={() => setShowForm((value) => !value)}
      >
        {showForm ? "Close" : "Create List"}
      </Button>
    </div>
  );
}
