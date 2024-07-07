"use client";
import * as React from "react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";

export function DrawerDialogButtonList() {
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
          <ProfileForm />
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
          <DrawerTitle>Edit profile</DrawerTitle>
          <DrawerDescription>
            Make changes to your profile here. Click save when youre done.
          </DrawerDescription>
        </DrawerHeader>
        <ProfileForm className="px-4" />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function ProfileForm({ className }: React.ComponentProps<"form">) {
  return (
    <form className={cn("grid items-start gap-4", className)}>
      <div className="my-9 flex flex-col items-center justify-center gap-2">
        {" "}
        <h2>You have no lists</h2>
        <Button type="submit" className="bg-indigo-500">
          Create one
        </Button>
      </div>

      <Button type="submit" className="bg-primaryM-500" disabled>
        Add
      </Button>
    </form>
  );
}
