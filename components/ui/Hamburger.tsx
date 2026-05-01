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
import { getUser } from "@/lib/actions";
import { CircleDot } from "lucide-react";
import { handleLogout } from "@/lib/actions";

export default async function Hamburger() {
  const user = await getUser();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="default"
          className="hidden bg-transparent hover:bg-transparent active:bg-transparent md:flex"
        >
          <div className="space-y-1">
            <div className="h-0.5 w-8 bg-current s:scale-y-75" />
            <div className="h-0.5 w-8 bg-current s:scale-y-75" />
            <div className="h-0.5 w-8 bg-current s:scale-y-75" />
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent className="border-none">
        <SheetHeader>
          {user ? (
            <div>
              <SheetTitle className="text-primaryM-400">
                Welcome {user?.name}
              </SheetTitle>
            </div>
          ) : (
            <SheetTitle className="text-primaryM-400">Please Log-in</SheetTitle>
          )}

          <SheetDescription>
            {user
              ? "You can now access your profile and bookmarks"
              : "You can log-in to access your profile and bookmarks"}
          </SheetDescription>
        </SheetHeader>
        <div className="py-24">
          <ul className="flex flex-col gap-5 text-2xl">
            <SheetClose asChild>
              <Link href="/">
                <li className="flex items-center gap-2">
                  <span className="">
                    <CircleDot className="w-3 text-sm" />
                  </span>
                  Home
                </li>
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link href="/explore">
                <li className="flex items-center gap-2">
                  <span className="">
                    <CircleDot className="w-3 text-sm" />
                  </span>
                  Explore
                </li>
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link href={"/upcoming"}>
                <li className="flex items-center gap-2">
                  {" "}
                  <span className="">
                    <CircleDot className="w-3 text-sm" />
                  </span>
                  Upcoming
                </li>
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link href={"/bookmarks"}>
                <li className="flex items-center gap-2">
                  <span className="">
                    <CircleDot className="w-3 text-sm" />
                  </span>
                  BookMarks
                </li>
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link href={"/search"}>
                <li className="flex items-center gap-2">
                  <span className="">
                    <CircleDot className="w-3 text-sm" />
                  </span>
                  Search
                </li>
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link href={"/profile"}>
                <li className="flex items-center gap-2">
                  <span className="">
                    <CircleDot className="w-3 text-sm" />
                  </span>
                  Profile
                </li>
              </Link>
            </SheetClose>
          </ul>
        </div>{" "}
        <SheetFooter>
          <SheetClose asChild className="w-full">
            {user ? (
              <form action={handleLogout}>
                <Button
                  type="submit"
                  className="w-full bg-primaryM-500 text-backgroundM hover:bg-primaryM-400 active:bg-primaryM-800"
                >
                  Log Out
                </Button>
              </form>
            ) : (
              <Link href="/sign-in">
                <Button
                  type="submit"
                  className="w-full bg-primaryM-500 text-backgroundM hover:bg-primaryM-400 active:bg-primaryM-800"
                >
                  Get Started
                </Button>
              </Link>
            )}
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
