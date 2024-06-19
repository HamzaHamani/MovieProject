import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import NavbarList from "../general/navbarList";
import { getSession } from "@/lib/utils";
import { CircleDot } from "lucide-react";

export default async function Hamburger() {
  const session = await getSession();
  console.log(session);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="default" className="bg-transparent hidden md:flex ">
          <div className="space-y-1">
            <div className="h-0.5 w-6 bg-current" />
            <div className="h-0.5 w-6 bg-current" />
            <div className="h-0.5 w-6 bg-current" />
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent className="border-none">
        <SheetHeader>
          <SheetTitle className="text-primaryM-400">Please Log-in</SheetTitle>
          <SheetDescription>
            So you can bookmark movies and access your profile
          </SheetDescription>
        </SheetHeader>
        <div className="py-10">
          <ul className="flex flex-col gap-5 text-2xl">
            <SheetClose asChild>
              <Link href="/">
                <li className="flex items-center gap-2">
                  <span className="">
                    <CircleDot className="text-sm w-3" />
                  </span>
                  Home
                </li>
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link href={"/explore"}>
                <li className="flex items-center gap-2">
                  {" "}
                  <span className="">
                    <CircleDot className="text-sm w-3" />
                  </span>
                  Explore
                </li>
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link href={"/bookmarks"}>
                <li className="flex items-center gap-2">
                  <span className="">
                    <CircleDot className="text-sm w-3" />
                  </span>
                  BookMarks
                </li>
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link href={"/search"}>
                <li className="flex items-center gap-2">
                  <span className="">
                    <CircleDot className="text-sm w-3" />
                  </span>
                  Search
                </li>
              </Link>
            </SheetClose>
          </ul>
        </div>{" "}
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit" className="bg-primaryM-500 text-backgroundM">
              {session != null ? "Log Out" : "Log In"}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
