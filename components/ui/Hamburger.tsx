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
import MenuAnimation from "@/components/animata/list/menu-animation";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/actions";
import { handleLogout } from "@/lib/actions";

export default async function Hamburger() {
  const user = await getUser();

  const menuItems = [
    { label: "Home", href: "/" },
    { label: "Explore", href: "/explore" },
    { label: "Feed", href: "/feed" },
    { label: "Upcoming", href: "/upcoming" },
    { label: "Bookmarks", href: "/bookmarks" },
    { label: "Search", href: "/search" },
    { label: "Profile", href: "/profile" },
  ];

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
          <div className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <SheetClose asChild key={item.href}>
                <Link href={item.href}>
                  <MenuAnimation menuItems={[item]} />
                </Link>
              </SheetClose>
            ))}
          </div>
        </div>
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
