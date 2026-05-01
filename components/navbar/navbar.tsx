import { Button } from "../ui/button";
import NavbarList from "./navbarList";
import Logo from "../general/logo";
import Hamburger from "../ui/Hamburger";
import Link from "next/link";
import { getUser } from "@/lib/actions";
import { UserDropDown } from "./userDropDown";
import NotificationBell from "./notificationBell";
import TransparentNavbarShell from "./transparentNavbarShell";

const links = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/upcoming", label: "Upcoming" },
  { href: "/bookmarks", label: "Bookmarks" },
  { href: "/search", label: "Search" },
];

type Props = {
  type: string;
};

const baseNavStyles =
  "mx-auto flex items-center justify-between p-4 px-16 text-textMain xmd:p-3 xmd:px-10 xmd:text-sm";

const normalNav = `${baseNavStyles} relative w-full bg-backgroundM`;
export default async function Navbar({ type }: Props) {
  const user = await getUser();

  if (type === "transparent") {
    return (
      <TransparentNavbarShell
        left={
          <>
            <Logo />
            <NavbarList links={links} />
          </>
        }
        right={
          user ? (
            <div className="flex items-center gap-3">
              <NotificationBell />
              <UserDropDown user={user} />
            </div>
          ) : (
            <Button className="bg-transparent font-extrabold hover:bg-transparent active:bg-transparent md:hidden">
              <Link href="/sign-in">Get Started</Link>
            </Button>
          )
        }
        mobile={<Hamburger />}
      />
    );
  }

  return (
    <nav className={`${normalNav} z-50`}>
      <div className="flex items-center gap-8">
        <Logo />
        <NavbarList links={links} />
      </div>
      {user ? (
        <div className="flex items-center gap-3">
          <NotificationBell />
          <UserDropDown user={user} />
        </div>
      ) : (
        <Button className="bg-transparent font-extrabold hover:bg-transparent active:bg-transparent md:hidden">
          <Link href="/sign-in">Get Started</Link>
        </Button>
      )}

      <Hamburger />
    </nav>
  );
}
