import { Button } from "../ui/button";
import NavbarList from "./navbarList";
import Logo from "../general/logo";
import Hamburger from "../ui/Hamburger";
import Link from "next/link";
import { getUser } from "@/lib/actions";
import { UserDropDown } from "./userDropDown";

const links = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/bookmarks", label: "Bookmarks" },
  { href: "/search", label: "Search" },
];

type Props = {};
export default async function Navbar({}: Props) {
  const user = await getUser();
  return (
    <nav className="round text-text absolute mx-auto flex w-full items-center justify-between bg-backgroundM p-4 px-16 xmd:p-3 xmd:px-10 xmd:text-sm">
      <Logo />
      <NavbarList links={links} />
      {user ? (
        <UserDropDown user={user} />
      ) : (
        <Button className="bg-transparent font-extrabold hover:bg-transparent active:bg-transparent md:hidden">
          <Link href="/sign-in">Get Started</Link>
        </Button>
      )}

      <Hamburger />
    </nav>
  );
}
